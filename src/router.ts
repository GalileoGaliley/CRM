import { createRouter } from "router5"
import browserPlugin from "router5-plugin-browser"

const router = createRouter([
  {
    name: "auth", path: "/auth?mode", defaultParams: {
      mode: 'auth'
    }
  },

  { name: "403", path: "/403" },

  { name: "dashboard", path: "/dashboard" },
  { name: "schedule", path: "/schedule" },
  { name: "booking", path: "/booking" },
  {
    children: [
      { name: "areas", path: "/areas" },
      { name: "sources", path: "/sources" },
      { name: "numbers", path: "/numbers" }
    ], name: "calls", path: "/calls"
  },
  {
    children: [
      { name: "new", path: "/new" },
      { name: "item", path: "/:clientId" }
    ], name: "clients", path: "/clients"
  },
  {
    children: [
      { name: "new", path: "/new" },
      { name: "item", path: "/:appointmentId" }
    ], name: "appointments", path: "/appointments"
  },
  {
    children: [
      { name: "item", path: "/:jobId" }
    ], name: "jobs", path: "/jobs"
  },
  { name: "estimates", path: "/estimates" },
  { name: "invoices", path: "/invoices" },
  { name: "payments", path: "/payments" },
  {
    children: [
      { name: "item", path: "/:absenceId" },
      { name: "new", path: "/new" }
    ], name: "absences", path: "/absences"
  },
  {
    children: [
      { name: "item", path: "/:serviceResourceId" },
      { name: "new", path: "/new" }
    ], name: "service_resources", path: "/service_resources"
  },
  { name: "tickets", path: "/tickets" },
  {
    children: [
      { name: "faq", path: "/faq" },
      { name: "tickets", path: "/tickets" },
      { name: "contacts", path: "/contacts" },
    ], name: "support", path: "/support"
  },
  {
    children: [
      { name: "appliances", path: "/appliances" },
      { name: "brands", path: "/brands" },
      { name: "sources", path: "/sources" },
      { name: "areas", path: "/areas" },
    ], name: "lists", path: "/lists",
  },
  {
    children: [
      { name: "new", path: "/new" },
      { name: "item", path: "/:permissionId" },
    ], name: "permissions", path: "/permissions"
  },
  {
    children: [
      { name: "new", path: "/new" },
      { name: "item", path: "/:permissionId" },
    ], name: "accounts_permissions", path: "/accountsPermissions"
  },
  {
    children: [
      { name: "new", path: "/new" },
      { name: "item", path: "/:userId" },
    ], name: "users", path: "/users"
  },
  {
    children: [
      { name: "new", path: "/new" },
      { name: "item", path: "/:accountId" },
    ], name: "accounts", path: "/accounts"
  },
  {
    children: [
      {
        children: [
          { name: "new", path: "/new" },
          { name: "item", path: "/item" },
        ], name: "phoneNumbers", path: "/phoneNumbers"
      },
      {
        children: [
          { name: "new", path: "/new" },
          { name: "item", path: "/item" },
        ], name: "dispatchers", path: "/dispatchers"
      },
      {
        children: [
          { name: "new", path: "/new" },
          { name: "item", path: "/item" },
        ], name: "groups", path: "/groups"
      },
      {
        children: [
          { name: "new", path: "/new" },
          { name: "item", path: "/item" },
        ], name: "callFlows", path: "/callFlows"
      },
      { name: "settings", path: "/settings" },
    ], name: "call_center", path: "/call_center", forwardTo: 'call_center.phoneNumbers'
  },
], {
  defaultRoute: "dashboard"
})

router.usePlugin(browserPlugin())
router.useMiddleware(() => (fromState, toState, done) => {

  if (!fromState || !toState) return done()

  if (fromState.name !== toState.name)
    window.scrollTo(0, 0)

  done()
})

export default router
