// Структура файлов проектов для 3D-визуализации («нейрон»).
//
// ⚠️ Это ПРЕДСТАВИТЕЛЬНЫЕ (примерные) деревья. Чтобы показать РЕАЛЬНУЮ
// структуру ваших репозиториев, замените деревья ниже. Проще всего
// сгенерировать дерево командой в корне репозитория, например:
//   npx tree-node-cli -a -I "node_modules|.git|dist" --base .
// или дать доступ к репозиториям — тогда дерево можно собрать автоматически.
//
// Ключи должны совпадать с `id` проектов из `projects.ts`
// (autudash / sollers / flexicalc).

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

const f = (name: string): FileNode => ({ name, type: 'file' });
const d = (name: string, children: FileNode[]): FileNode => ({ name, type: 'folder', children });

export const fileTrees: Record<string, FileNode> = {
  autudash: d('AutuDash', [
    d('src', [
      d('components', [
        d('charts', [f('SalesChart.tsx'), f('ChannelsChart.tsx')]),
        f('Sidebar.tsx'),
        f('Topbar.tsx'),
        f('OrdersTable.tsx'),
        f('StatCard.tsx'),
      ]),
      d('hooks', [f('useOrders.ts'), f('useFilters.ts')]),
      d('pages', [f('Dashboard.tsx'), f('Orders.tsx'), f('Analytics.tsx')]),
      d('data', [f('orders.ts'), f('mock.ts')]),
      f('App.tsx'),
      f('main.tsx'),
      f('index.css'),
    ]),
    d('public', [f('favicon.svg')]),
    f('index.html'),
    f('package.json'),
    f('tsconfig.json'),
    f('vite.config.ts'),
  ]),

  sollers: d('Sollers Shop', [
    d('src', [
      d('components', [
        f('ProductCard.tsx'),
        f('Filters.tsx'),
        f('PriceSlider.tsx'),
        f('Cart.tsx'),
        f('Skeleton.tsx'),
      ]),
      d('context', [f('CartContext.tsx')]),
      d('api', [f('products.ts')]),
      d('hooks', [f('useProducts.ts')]),
      f('App.tsx'),
      f('main.tsx'),
      f('index.css'),
    ]),
    f('index.html'),
    f('package.json'),
    f('vite.config.ts'),
  ]),

  flexicalc: d('FlexiCalc', [
    d('src', [
      d('components', [
        d('steps', [f('Step1.tsx'), f('Step2.tsx'), f('Step3.tsx'), f('Step4.tsx')]),
        f('Progress.tsx'),
        f('Result.tsx'),
        f('LeadForm.tsx'),
      ]),
      d('hooks', [f('useCalculator.ts')]),
      d('data', [f('pricing.ts')]),
      f('App.tsx'),
      f('main.tsx'),
      f('index.css'),
    ]),
    f('index.html'),
    f('package.json'),
    f('vite.config.ts'),
  ]),
};
