-- Owner-managed workspace membership.
-- Existing users are looked up inside SECURITY DEFINER functions so frontend
-- code never needs service-role credentials or direct auth.users access.

CREATE OR REPLACE FUNCTION add_workspace_member_by_email(target_workspace_id UUID, member_email TEXT)
RETURNS workspace_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id UUID;
  inserted_member workspace_members;
BEGIN
  IF NOT is_workspace_owner(target_workspace_id) THEN
    RAISE EXCEPTION 'Only workspace owners can add members';
  END IF;

  IF length(trim(member_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  SELECT u.id
  INTO target_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(member_email))
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No registered user found for that email';
  END IF;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (target_workspace_id, target_user_id, 'member')
  RETURNING * INTO inserted_member;

  RETURN inserted_member;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'User is already a member of this workspace';
END;
$$;

CREATE OR REPLACE FUNCTION remove_workspace_member(target_workspace_id UUID, target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_role workspace_role;
  owner_count INTEGER;
BEGIN
  IF NOT is_workspace_owner(target_workspace_id) THEN
    RAISE EXCEPTION 'Only workspace owners can remove members';
  END IF;

  SELECT role
  INTO target_role
  FROM workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = target_user_id;

  IF target_role IS NULL THEN
    RAISE EXCEPTION 'User is not a member of this workspace';
  END IF;

  IF target_role = 'owner' THEN
    SELECT count(*)
    INTO owner_count
    FROM workspace_members
    WHERE workspace_id = target_workspace_id
      AND role = 'owner';

    IF owner_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last workspace owner';
    END IF;
  END IF;

  DELETE FROM workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION add_workspace_member_by_email(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_workspace_member(UUID, UUID) TO authenticated;
