// src/pages/products/ProductsPage.tsx

import { useState, useEffect } from 'react';
import { Package, Tag, Layers } from 'lucide-react';
import { productService } from '@/services/product.service';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const getTotalCount = (response: unknown): number => {
  if (!response) return 0;

  if (Array.isArray(response)) {
    return response.length;
  }

  if (typeof response === 'object' && response !== null) {
    const { totalElements, content } = response as {
      totalElements?: number;
      content?: unknown[];
    };

    if (typeof totalElements === 'number') {
      return totalElements;
    }

    if (Array.isArray(content)) {
      return content.length;
    }
  }

  return 0;
};

export const ProductsPage = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalVariants: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [itemsResponse, categoriesResponse, variantsResponse] = await Promise.all([
          productService.getItems({ page: 0, size: 1 }),
          productService.getCategories({ page: 0, size: 1 }),
          productService.getItemVariants({ page: 0, size: 1 }),
        ]);

        setStats({
          totalItems: getTotalCount(itemsResponse),
          totalCategories: getTotalCount(categoriesResponse),
          totalVariants: getTotalCount(variantsResponse),
        });
      } catch (error) {
        console.error('Failed to fetch product stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Products Management
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your products, categories, and variants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="p-6 hover:shadow-3d-lg transition-shadow cursor-pointer"
            onClick={() => navigate(ROUTES.PRODUCTS_ITEMS)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Total Items
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.totalItems}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="p-6 hover:shadow-3d-lg transition-shadow cursor-pointer"
            onClick={() => navigate(ROUTES.CATEGORIES)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Categories
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent-teal/10 dark:bg-accent-teal/20">
                <Tag className="w-8 h-8 text-accent-teal" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className="p-6 hover:shadow-3d-lg transition-shadow cursor-pointer"
            onClick={() => navigate(ROUTES.PRODUCTS_ITEM_VARIANTS)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Variants
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.totalVariants}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 dark:bg-success/20">
                <Layers className="w-8 h-8 text-success" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(ROUTES.PRODUCTS_ITEMS)}
              icon={<Package className="w-5 h-5" />}
            >
              Manage Items
            </Button>
            <Button
              variant="accent"
              fullWidth
              onClick={() => navigate(ROUTES.CATEGORIES)}
              icon={<Tag className="w-5 h-5" />}
            >
              Manage Categories
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate(ROUTES.PRODUCTS_ITEM_VARIANTS)}
              icon={<Layers className="w-5 h-5" />}
            >
              Manage Variants
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Active Items</span>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {stats.totalItems}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Categories</span>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {stats.totalCategories}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Variants</span>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {stats.totalVariants}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
