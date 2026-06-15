abstract class ApiEndpoints {
  // Auth
  static const login = '/api/auth/login';
  static const logout = '/api/auth/logout';
  static const refreshToken = '/api/auth/refresh';
  static const forgotPassword = '/api/auth/forgot-password';

  // Users
  static const me = '/api/users/me';
  static const users = '/api/users';

  // Products
  static const items = '/api/items';
  static String itemById(dynamic id) => '/api/items/$id';
  static const categories = '/api/categories';
  static const itemVariants = '/api/item-variants';
  static String variantsByItem(dynamic id) => '/api/item-variants?itemId=$id';

  // Inventory
  static const inventory = '/api/inventory';
  static String inventoryByItem(dynamic id) => '/api/inventory?itemId=$id';
  static const lots = '/api/lots';
  static const serials = '/api/serials';

  // Movements
  static const movements = '/api/movements';
  static String movementById(dynamic id) => '/api/movements/$id';
  static const movementLines = '/api/movement-lines';
  static const movementTasks = '/api/movement-tasks';

  // Locations
  static const locations = '/api/locations';
  static const sites = '/api/sites';
  static const warehouses = '/api/warehouses';

  // Alerts
  static const alerts = '/api/alerts';
  static const notifications = '/api/notifications';

  // Purchase
  static const suppliers = '/api/suppliers';
  static const purchaseOrders = '/api/purchase-orders';

  // Sales
  static const customers = '/api/customers';
  static const quotes = '/api/quotes';
  static const deliveryNotes = '/api/delivery-notes';
}
