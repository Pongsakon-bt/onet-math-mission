/** Dashboard visibility follows the validated account, never browser storage. */
export function canShowDashboard(account: { id: string } | null | undefined): boolean {
  return Boolean(account?.id);
}