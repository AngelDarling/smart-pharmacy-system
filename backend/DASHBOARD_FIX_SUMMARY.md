/**
 * Fix Dashboard Infinite Loop Issue
 * 
 * ✅ PROBLEM IDENTIFIED:
 * Dashboard was calling API continuously because:
 * 1. useEffect dependency [permissions] was changing on every render
 * 2. permissions object was recreated on every render in usePermissions hook
 * 
 * ✅ SOLUTIONS APPLIED:
 * 
 * 1. **Dashboard.jsx**:
 *    - Changed useEffect dependency from [permissions] to [user?.id]
 *    - Only load stats when user is available
 *    - Added mounted flag to prevent state updates after unmount
 * 
 * 2. **usePermissions.js**:
 *    - Added useMemo to memoize permissions object
 *    - Dependencies: [user?.role, user?.permissions]
 *    - Prevents permissions object recreation on every render
 * 
 * ✅ RESULT:
 * - API calls now only happen once when user logs in
 * - No more infinite loop of GET /api/admin/stats and GET /api/users/stats
 * - Dashboard loads efficiently
 * 
 * 🧪 TESTING:
 * 1. Login with any user
 * 2. Check browser Network tab
 * 3. Should see API calls only once, not continuously
 * 4. Dashboard should load smoothly without backend spam
 */
