'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  User,
  Wallet,
  Clock,
  StickyNote,
  Menu,
  X,
  Languages,
} from 'lucide-react';
import { useLanguage, useTranslations } from '@/contexts/language-context';

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useLanguage();
  const t = useTranslations('nav');

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const navItems = [
    { href: '/activities', icon: Activity, label: t('activities') },
    { href: '/time', icon: Clock, label: t('time') },
    { href: '/notes', icon: StickyNote, label: t('notes') },
    { href: '/finance', icon: Wallet, label: t('finance') },
    { href: '/profile', icon: User, label: t('profile') },
  ];

  const toggleLocale = () => setLocale(locale === 'en' ? 'es' : 'en');

  return (
    <>
      {/* Mobile: Top bar with hamburger menu */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/5 dark:bg-white/5 border-b border-border z-50 backdrop-blur-md">
        <div className="flex items-center justify-between h-full px-4">
          <button
            type="button"
            onClick={toggleMenu}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label={isOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            href="/"
            className="font-brand text-xl tracking-wide text-foreground"
          >
            LifeTracker
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-xs font-semibold"
              aria-label="Toggle language"
            >
              <Languages className="h-4 w-4" />
            </button>
            <Link
              href="/profile"
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                pathname === '/profile'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
              aria-label={t('profile')}
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile: Backdrop overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile: Slide-down menu */}
      <nav
        className={`md:hidden fixed top-16 left-0 right-0 z-50 bg-background/95 border-b border-border backdrop-blur-md transform transition-all duration-200 ease-out ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <ul className="flex flex-col py-2">
          {navItems
            .filter((item) => item.href !== '/profile')
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Mobile: Spacer for fixed header */}
      <div className="md:hidden h-16" />

      {/* Desktop: Bottom navigation bar */}
      <nav className="hidden md:block fixed bottom-0 left-0 right-0 bg-white/5 dark:bg-white/5 border-t border-border z-50 backdrop-blur-sm">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggleLocale}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Toggle language"
          >
            <Languages className="h-5 w-5" />
            <span className="text-xs font-medium uppercase">{locale}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
