// Stub for next-intl/navigation used in jsdom/Vitest environment.
// createNavigation requires Next.js runtime (next/navigation) which is
// unavailable in jsdom. This stub lets routing.ts be imported for unit tests.
export function createNavigation(_routing: unknown) {
  return {
    Link: null,
    redirect: null,
    usePathname: null,
    useRouter: null,
    getPathname: null,
  };
}
