import type { Access, FieldAccess } from "payload";

type CmsUser = { role?: "admin" | "editor" } | null;

export const authenticated: Access = ({ req }) => Boolean(req.user);
export const adminsOnly: Access = ({ req }) => (req.user as CmsUser)?.role === "admin";
export const adminsOnlyField: FieldAccess = ({ req }) => (req.user as CmsUser)?.role === "admin";
export const noPublicAccess: Access = () => false;

export const contentManagers: Access = ({ req }) => {
  const role = (req.user as CmsUser)?.role;
  return role === "admin" || role === "editor";
};
