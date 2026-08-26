import type { OwnerSide, RoleId, SpecialCategory } from "./types";

export type CtapRole = {
  id: RoleId;
  name: string;
  title: string;
  side: OwnerSide;
};

export const KENZY: CtapRole = {
  id: "kenzy",
  name: "Kenzy",
  title: "Out front",
  side: "bar",
};

export const TOM: CtapRole = {
  id: "tom",
  name: "Tom",
  title: "Kitchen manager",
  side: "kitchen",
};

export const MYKE: CtapRole = {
  id: "myke",
  name: "Myke",
  title: "Operations",
  side: "ops",
};

export const CTAP_ROLES: Record<RoleId, CtapRole> = {
  kenzy: KENZY,
  tom: TOM,
  myke: MYKE,
};

export function ownerForCategory(category: SpecialCategory): RoleId {
  if (category === "drink" || category === "bar") return "kenzy";
  if (category === "food") return "tom";
  return "myke";
}

export function canManagerApprove(
  actor: RoleId,
  category: SpecialCategory
): boolean {
  if (actor === "myke") return true;
  return ownerForCategory(category) === actor;
}

export function canReleaseHumes(actor: RoleId): boolean {
  return actor === "myke";
}
