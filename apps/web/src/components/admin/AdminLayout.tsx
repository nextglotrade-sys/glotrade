"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Settings,
  BarChart3,
  FileText,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  ShoppingCart,
  Wallet,
  Package,
  CreditCard,
  TicketPercent,
  ChevronDown,
  Ticket,
  History,
} from "lucide-react";
import { logout } from "@/utils/auth";

const managerWorkspaceByRole: Record<string, string> = {
  product_manager: "/admin/products",
  order_manager: "/admin/orders",
  insured_partners_manager: "/admin/gdip",
  bazaar_manager: "/admin/trade-fair",
};

const managerRoleLabels: Record<string, string> = {
  product_manager: "Product Manager",
  order_manager: "Order Manager",
  insured_partners_manager: "Insured Partners Manager",
  bazaar_manager: "Event & Trade Fair Manager",
};

const isManagerRole = (role?: string) => Boolean(role && managerWorkspaceByRole[role]);

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  adminOnly?: boolean; // Only show to admin/super admin
  superAdminOnly?: boolean; // Only show to super admin
  allowedRoles?: string[];
}

const adminMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={20} />,
    adminOnly: true
  },
  {
    label: "Trade Fair 2026",
    href: "/admin/trade-fair",
    icon: <Ticket size={20} />,
    allowedRoles: ["admin", "bazaar_manager"]
  },
  {
    label: "Bazaar Abuja (Archive)",
    href: "/admin/bazaar",
    icon: <History size={20} />,
    allowedRoles: ["admin", "bazaar_manager"]
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: <Users size={20} />,
    adminOnly: true // Only show to admins, not product managers
  },
  {
    label: "Manager Accounts",
    href: "/admin/managers",
    icon: <Users size={20} />,
    adminOnly: true
  },
  {
    label: "Product Management",
    href: "/admin/products",
    icon: <Package size={20} />,
    allowedRoles: ["admin", "product_manager"]
  },
  {
    label: "Order Management",
    href: "/admin/orders",
    icon: <ShoppingCart size={20} />,
    allowedRoles: ["admin", "order_manager"]
  },
  {
    label: "Withdrawals",
    href: "/admin/withdrawals",
    icon: <Wallet size={20} />,
    adminOnly: true
  },
  {
    label: "Wallets",
    href: "/admin/wallets",
    icon: <Wallet size={20} />,
    adminOnly: true
  },
  {
    label: "Sales Agents",
    href: "/admin/sales-agents",
    icon: <Users size={20} />,
    adminOnly: true
  },
  {
    label: "Credit Requests",
    href: "/admin/credit-requests",
    icon: <CreditCard size={20} />,
    adminOnly: true
  },
  {
    label: "Insured Partners",
    href: "/admin/gdip",
    icon: <Shield size={20} />,
    allowedRoles: ["admin", "insured_partners_manager"]
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart3 size={20} />,
    adminOnly: true
  },
  {
    label: "Security Reports",
    href: "/admin/security",
    icon: <Shield size={20} />,
    adminOnly: true
  },
  {
    label: "Platform Settings",
    href: "/admin/settings",
    icon: <Settings size={20} />,
    adminOnly: true
  },
  {
    label: "Banners",
    href: "/admin/banners",
    icon: <Store size={20} />,
    adminOnly: true
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: <FileText size={20} />,
    adminOnly: true
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: <TicketPercent size={20} />,
    adminOnly: true
  },
  {
    label: "Store Settings",
    href: "/admin/store",
    icon: <Store size={20} />,
    adminOnly: true
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkScroll = () => {
      if (navRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = navRef.current;
        // Show indicator if there's more content to scroll and we're not at the bottom
        // Use a small threshold (e.g., 10px) to avoid flickering near the bottom
        setShowScrollIndicator(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 10);
      }
    };

    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('scroll', checkScroll);
      // Check initially and on window resize
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (navElement) {
        navElement.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [user]); // Re-run when user loads/changes as menu items might change

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('afritrade:user');

        if (userData) {
          const user = JSON.parse(userData);
          setUser(user);

          // Allow admin, super admin, and manager roles
          if (user.role !== "admin" && !user.isSuperAdmin && !isManagerRole(user.role)) {
            router.push("/dashboard");
            return;
          }
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        router.push("/auth/login");
      }
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user || user.isSuperAdmin || user.role === "admin") return;

    const userRoles: string[] = [user.role, ...(user.assignedRoles || [])];
    const allowedPaths = userRoles.map(r => managerWorkspaceByRole[r]).filter(Boolean);

    const isPathAllowed = allowedPaths.some(path => pathname.startsWith(path));
    if (!isPathAllowed && allowedPaths.length > 0) {
      router.replace(allowedPaths[0]);
    }
  }, [pathname, router, user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isActiveRoute(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        onClick={() => setSidebarOpen(false)}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
        {item.children && <ChevronRight size={16} className="ml-auto" />}
      </Link>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin interface...</p>
          <p className="mt-2 text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Higher z-index to appear above header */}
      <div className={`fixed top-0 left-0 z-[70] w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user.username?.charAt(0)?.toUpperCase() || user.firstName?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.username || user.firstName || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user.isSuperAdmin
                    ? "Super Admin"
                    : user.role === "admin"
                    ? "Administrator"
                    : Array.isArray(user.assignedRoles) && user.assignedRoles.length > 0
                    ? user.assignedRoles.map((r: string) => managerRoleLabels[r] || r).join(" • ")
                    : managerRoleLabels[user.role] || "Administrator"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation - with scroll */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <nav
              ref={navRef}
              className="flex-1 px-4 py-6 space-y-2 overflow-y-auto bg-white scrollbar-hide"
            >
              {adminMenuItems
                .filter(item => {
                  // Filter menu items based on user role and assignedRoles
                  if (item.superAdminOnly && !user.isSuperAdmin) return false;
                  if (item.adminOnly && isManagerRole(user.role)) return false;
                  if (item.allowedRoles && !user.isSuperAdmin && user.role !== 'admin') {
                    const userRoles = [user.role, ...(user.assignedRoles || [])];
                    const hasRoleAccess = item.allowedRoles.some(r => userRoles.includes(r));
                    if (!hasRoleAccess) return false;
                  }
                  return true;
                })
                .map(renderMenuItem)}
            </nav>

            {/* Scroll Indicator */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 flex items-end justify-center pb-2 ${showScrollIndicator ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-100 animate-bounce">
                <ChevronDown size={16} className="text-blue-500" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="space-y-2">
              {!isManagerRole(user.role) && (
                <>
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Home size={20} />
                    <span className="font-medium">Back to Homepage</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">User Dashboard</span>
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 h-full flex flex-col overflow-hidden">
        {/* Top bar - Lower z-index than sidebar */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-[40]">
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span>Welcome back,</span>
                <span className="font-medium text-gray-700">
                  {user.username || user.firstName || "Admin"}
                </span>
              </div>
              <div className="sm:hidden text-sm font-medium text-gray-700">
                {user.username || user.firstName || "Admin"}
              </div>
            </div>
          </div>
        </div>

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
