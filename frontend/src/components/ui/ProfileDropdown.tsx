import * as React from "react";
import { cn } from "@/utils/cn";
import { Settings, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
    onClick?: () => void;
}

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    user: {
        firstName?: string;
        lastName?: string;
        username?: string;
        email?: string;
        profileImageUrl?: string;
        roles?: string[];
    };
    onLogout: () => void;
    onProfileClick: () => void;
    onSettingsClick: () => void;
    showAvatar?: boolean;
    translations: {
        profile: string;
        settings: string;
        logout: string;
    };
}

export function ProfileDropdown({
    user,
    onLogout,
    onProfileClick,
    onSettingsClick,
    showAvatar = true,
    translations,
    className,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    
    const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username || 'User';

    const menuItems: MenuItem[] = [
        {
            label: translations.profile,
            href: "/profile",
            icon: <User className="w-4 h-4" />,
            onClick: onProfileClick
        },
        {
            label: translations.settings,
            href: "/settings",
            icon: <Settings className="w-4 h-4" />,
            onClick: onSettingsClick
        },
    ];

    const getUserInitials = () => {
        if (user.firstName && user.lastName) {
            return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        }
        return user.username?.substring(0, 2).toUpperCase() || 'U';
    };

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-4 lg:gap-8 p-1.5 lg:p-2 rounded-2xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 hover:border-primary-500/50 dark:hover:border-primary-500/50 hover:bg-white dark:hover:bg-neutral-900 hover:shadow-lg transition-all duration-300 focus:outline-none group/trigger"
                        >
                            <div className="text-left hidden lg:block ml-2">
                                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight group-hover/trigger:text-primary-600 dark:group-hover/trigger:text-primary-400 transition-colors">
                                    {fullName}
                                </div>
                                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 tracking-wider uppercase font-bold mt-0.5">
                                    {user.email}
                                </div>
                            </div>
                            {showAvatar && (
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-accent-teal p-0.5 shadow-lg shadow-primary-500/20 group-hover/trigger:scale-105 transition-transform duration-300">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-neutral-900 border-2 border-white dark:border-neutral-900">
                                            {user.profileImageUrl ? (
                                                <img
                                                    src={user.profileImageUrl}
                                                    alt={fullName}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-sm">
                                                    {getUserInitials()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Online Status Dot */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full shadow-sm" />
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>

                    {/* Bending line indicator on the right */}
                    <div
                        className={cn(
                            "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-300 hidden lg:block",
                            isOpen
                                ? "opacity-100 translate-x-0.5"
                                : "opacity-0 group-hover:opacity-40 translate-x-0"
                        )}
                    >
                        <svg
                            width="12"
                            height="24"
                            viewBox="0 0 12 24"
                            fill="none"
                            className={cn(
                                "transition-all duration-300",
                                isOpen
                                    ? "text-primary-500 dark:text-primary-400 scale-110"
                                    : "text-neutral-400 dark:text-neutral-500"
                            )}
                            aria-hidden="true"
                        >
                            <path
                                d="M2 4C6 8 6 16 2 20"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={12}
                        className="w-56 p-1.5 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl shadow-2xl shadow-black/10 transition-all"
                    >
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    <Link
                                        to={item.href}
                                        onClick={(e) => {
                                            if (item.onClick) {
                                                e.preventDefault();
                                                item.onClick();
                                            }
                                        }}
                                        className="flex items-center gap-2 p-2 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary-500/10"
                                    >
                                        <div className="flex items-center gap-2.5 flex-1">
                                            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:bg-primary-500/10 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">
                                                {item.label}
                                            </span>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-1.5 bg-neutral-200/50 dark:bg-neutral-800/50" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 p-2 duration-200 bg-red-50 dark:bg-red-500/5 rounded-xl hover:bg-red-500/10 cursor-pointer border border-transparent hover:border-red-500/20 hover:shadow-sm transition-all group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
                                    {translations.logout}
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
