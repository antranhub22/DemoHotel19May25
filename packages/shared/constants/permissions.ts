// ============================================
// BACKWARD COMPATIBILITY RE-EXPORT
// ============================================
// This file maintains backward compatibility for components 
// that still import from @shared/constants/permissions

// Re-export everything from the new location in auth-system
export * from '../../auth-system/types/permissions';

// Explicit re-exports for commonly used items
export { 
  PERMISSION_MATRIX,
  ROLE_MENU_CONFIG,
  hasRolePermission,
  getPermissionsForRole
} from '../../auth-system/types/permissions'; 