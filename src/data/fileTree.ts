// Реальная структура файлов проектов для 3D-визуализации («нейрон»).
//
// Сгенерировано автоматически из GitHub-репозиториев:
//   autudash  → Joedo-true/-AutuDash-CRM
//   sollers   → Joedo-true/-sollers-shop
//   flexicalc → Joedo-true/FlexiCalc
// Исключены: .git, node_modules, dist, build и прочий мусор сборки.
//
// Чтобы обновить — перегенерируйте дерево из репозитория и вставьте сюда.
// Ключи совпадают с `id` проектов из `projects.ts`.

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export const fileTrees: Record<string, FileNode> = {
  "autudash": {
    "name": "AutuDash",
    "type": "folder",
    "children": [
      {
        "name": "public",
        "type": "folder",
        "children": [
          {
            "name": "favicon.svg",
            "type": "file"
          },
          {
            "name": "pwa-192x192.png",
            "type": "file"
          },
          {
            "name": "pwa-512x512.png",
            "type": "file"
          }
        ]
      },
      {
        "name": "src",
        "type": "folder",
        "children": [
          {
            "name": "api",
            "type": "folder",
            "children": [
              {
                "name": "http",
                "type": "folder",
                "children": [
                  {
                    "name": "HttpDataSource.ts",
                    "type": "file"
                  }
                ]
              },
              {
                "name": "local",
                "type": "folder",
                "children": [
                  {
                    "name": "analytics.ts",
                    "type": "file"
                  },
                  {
                    "name": "LocalDataSource.ts",
                    "type": "file"
                  },
                  {
                    "name": "queries.ts",
                    "type": "file"
                  },
                  {
                    "name": "store.ts",
                    "type": "file"
                  }
                ]
              },
              {
                "name": "config.ts",
                "type": "file"
              },
              {
                "name": "DataSource.ts",
                "type": "file"
              },
              {
                "name": "index.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "components",
            "type": "folder",
            "children": [
              {
                "name": "clients",
                "type": "folder",
                "children": [
                  {
                    "name": "ClientCard.tsx",
                    "type": "file"
                  },
                  {
                    "name": "ClientFormDialog.tsx",
                    "type": "file"
                  }
                ]
              },
              {
                "name": "dashboard",
                "type": "folder",
                "children": [
                  {
                    "name": "KpiCard.tsx",
                    "type": "file"
                  },
                  {
                    "name": "SalesChart.tsx",
                    "type": "file"
                  },
                  {
                    "name": "TopProductsChart.tsx",
                    "type": "file"
                  }
                ]
              },
              {
                "name": "layout",
                "type": "folder",
                "children": [
                  {
                    "name": "AppLayout.tsx",
                    "type": "file"
                  },
                  {
                    "name": "Header.tsx",
                    "type": "file"
                  },
                  {
                    "name": "nav.ts",
                    "type": "file"
                  },
                  {
                    "name": "PageLoader.tsx",
                    "type": "file"
                  },
                  {
                    "name": "Sidebar.tsx",
                    "type": "file"
                  }
                ]
              },
              {
                "name": "orders",
                "type": "folder",
                "children": [
                  {
                    "name": "OrderDetailsDialog.tsx",
                    "type": "file"
                  },
                  {
                    "name": "OrderFilters.tsx",
                    "type": "file"
                  },
                  {
                    "name": "OrderFormDialog.tsx",
                    "type": "file"
                  },
                  {
                    "name": "OrdersTable.tsx",
                    "type": "file"
                  }
                ]
              },
              {
                "name": "ui",
                "type": "folder",
                "children": [
                  {
                    "name": "avatar.tsx",
                    "type": "file"
                  },
                  {
                    "name": "badge.tsx",
                    "type": "file"
                  },
                  {
                    "name": "button.tsx",
                    "type": "file"
                  },
                  {
                    "name": "card.tsx",
                    "type": "file"
                  },
                  {
                    "name": "confirm-dialog.tsx",
                    "type": "file"
                  },
                  {
                    "name": "dialog.tsx",
                    "type": "file"
                  },
                  {
                    "name": "dropdown-menu.tsx",
                    "type": "file"
                  },
                  {
                    "name": "input.tsx",
                    "type": "file"
                  },
                  {
                    "name": "label.tsx",
                    "type": "file"
                  },
                  {
                    "name": "pagination.tsx",
                    "type": "file"
                  },
                  {
                    "name": "select.tsx",
                    "type": "file"
                  },
                  {
                    "name": "skeleton.tsx",
                    "type": "file"
                  },
                  {
                    "name": "switch.tsx",
                    "type": "file"
                  },
                  {
                    "name": "table.tsx",
                    "type": "file"
                  },
                  {
                    "name": "tabs.tsx",
                    "type": "file"
                  }
                ]
              }
            ]
          },
          {
            "name": "contexts",
            "type": "folder",
            "children": [
              {
                "name": "theme-context.ts",
                "type": "file"
              },
              {
                "name": "ThemeProvider.tsx",
                "type": "file"
              }
            ]
          },
          {
            "name": "data",
            "type": "folder",
            "children": [
              {
                "name": "catalog.ts",
                "type": "file"
              },
              {
                "name": "mock.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "hooks",
            "type": "folder",
            "children": [
              {
                "name": "useClients.ts",
                "type": "file"
              },
              {
                "name": "useCountUp.ts",
                "type": "file"
              },
              {
                "name": "useDashboard.ts",
                "type": "file"
              },
              {
                "name": "useDebounce.ts",
                "type": "file"
              },
              {
                "name": "useOrders.ts",
                "type": "file"
              },
              {
                "name": "useSmoothScroll.ts",
                "type": "file"
              },
              {
                "name": "useTheme.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "lib",
            "type": "folder",
            "children": [
              {
                "name": "domain.ts",
                "type": "file"
              },
              {
                "name": "utils.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "pages",
            "type": "folder",
            "children": [
              {
                "name": "ClientsPage.tsx",
                "type": "file"
              },
              {
                "name": "DashboardPage.tsx",
                "type": "file"
              },
              {
                "name": "NotFoundPage.tsx",
                "type": "file"
              },
              {
                "name": "OrdersPage.tsx",
                "type": "file"
              },
              {
                "name": "SettingsPage.tsx",
                "type": "file"
              }
            ]
          },
          {
            "name": "types",
            "type": "folder",
            "children": [
              {
                "name": "index.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "App.tsx",
            "type": "file"
          },
          {
            "name": "index.css",
            "type": "file"
          },
          {
            "name": "main.tsx",
            "type": "file"
          },
          {
            "name": "vite-env.d.ts",
            "type": "file"
          }
        ]
      },
      {
        "name": ".env.example",
        "type": "file"
      },
      {
        "name": ".gitignore",
        "type": "file"
      },
      {
        "name": "AutuDash-CRM.html",
        "type": "file"
      },
      {
        "name": "index.html",
        "type": "file"
      },
      {
        "name": "package-lock.json",
        "type": "file"
      },
      {
        "name": "package.json",
        "type": "file"
      },
      {
        "name": "postcss.config.js",
        "type": "file"
      },
      {
        "name": "README.md",
        "type": "file"
      },
      {
        "name": "tailwind.config.js",
        "type": "file"
      },
      {
        "name": "tsconfig.app.json",
        "type": "file"
      },
      {
        "name": "tsconfig.json",
        "type": "file"
      },
      {
        "name": "tsconfig.node.json",
        "type": "file"
      },
      {
        "name": "vite.config.ts",
        "type": "file"
      }
    ]
  },
  "sollers": {
    "name": "Sollers Shop",
    "type": "folder",
    "children": [
      {
        "name": "public",
        "type": "folder",
        "children": [
          {
            "name": "favicon.svg",
            "type": "file"
          }
        ]
      },
      {
        "name": "src",
        "type": "folder",
        "children": [
          {
            "name": "api",
            "type": "folder",
            "children": [
              {
                "name": "products.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "components",
            "type": "folder",
            "children": [
              {
                "name": "CartDrawer.tsx",
                "type": "file"
              },
              {
                "name": "CartItemRow.tsx",
                "type": "file"
              },
              {
                "name": "CategoryChips.tsx",
                "type": "file"
              },
              {
                "name": "ErrorState.tsx",
                "type": "file"
              },
              {
                "name": "FilterSidebar.tsx",
                "type": "file"
              },
              {
                "name": "Footer.tsx",
                "type": "file"
              },
              {
                "name": "Header.tsx",
                "type": "file"
              },
              {
                "name": "Hero.tsx",
                "type": "file"
              },
              {
                "name": "ProductCard.tsx",
                "type": "file"
              },
              {
                "name": "ProductCardSkeleton.tsx",
                "type": "file"
              },
              {
                "name": "ProductGrid.tsx",
                "type": "file"
              },
              {
                "name": "PromoBar.tsx",
                "type": "file"
              },
              {
                "name": "RangeSlider.tsx",
                "type": "file"
              },
              {
                "name": "ScrollToTop.tsx",
                "type": "file"
              },
              {
                "name": "SortSelect.tsx",
                "type": "file"
              },
              {
                "name": "StarRating.tsx",
                "type": "file"
              }
            ]
          },
          {
            "name": "hooks",
            "type": "folder",
            "children": [
              {
                "name": "useDebounce.ts",
                "type": "file"
              },
              {
                "name": "useSmoothScroll.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "store",
            "type": "folder",
            "children": [
              {
                "name": "cartStore.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "utils",
            "type": "folder",
            "children": [
              {
                "name": "catalog.ts",
                "type": "file"
              },
              {
                "name": "format.ts",
                "type": "file"
              }
            ]
          },
          {
            "name": "App.tsx",
            "type": "file"
          },
          {
            "name": "index.css",
            "type": "file"
          },
          {
            "name": "main.tsx",
            "type": "file"
          },
          {
            "name": "types.ts",
            "type": "file"
          },
          {
            "name": "vite-env.d.ts",
            "type": "file"
          }
        ]
      },
      {
        "name": ".gitignore",
        "type": "file"
      },
      {
        "name": "index.html",
        "type": "file"
      },
      {
        "name": "package-lock.json",
        "type": "file"
      },
      {
        "name": "package.json",
        "type": "file"
      },
      {
        "name": "postcss.config.js",
        "type": "file"
      },
      {
        "name": "README.md",
        "type": "file"
      },
      {
        "name": "tailwind.config.js",
        "type": "file"
      },
      {
        "name": "tsconfig.app.json",
        "type": "file"
      },
      {
        "name": "tsconfig.json",
        "type": "file"
      },
      {
        "name": "tsconfig.node.json",
        "type": "file"
      },
      {
        "name": "vite.config.ts",
        "type": "file"
      }
    ]
  },
  "flexicalc": {
    "name": "FlexiCalc",
    "type": "folder",
    "children": [
      {
        "name": "index.html",
        "type": "file"
      },
      {
        "name": "README.md",
        "type": "file"
      }
    ]
  }
};
