import * as migration_20260928_074057_phase25_foundation from './20260928_074057_phase25_foundation';
import * as migration_20261004_083431_phase25c_commerce_offers from './20261004_083431_phase25c_commerce_offers';
import * as migration_20261004_091825_phase25d_cart_checkout_orders from './20261004_091825_phase25d_cart_checkout_orders';
import * as migration_20261004_202041_phase26_content_system from './20261004_202041_phase26_content_system';
import * as migration_20261005_120000_phase30_return_insight_to_draft from './20261005_120000_phase30_return_insight_to_draft';
import * as migration_20261010_124616_phase30b_railway_storage from './20261010_124616_phase30b_railway_storage';

export const migrations = [
  {
    up: migration_20260928_074057_phase25_foundation.up,
    down: migration_20260928_074057_phase25_foundation.down,
    name: '20260928_074057_phase25_foundation',
  },
  {
    up: migration_20261004_083431_phase25c_commerce_offers.up,
    down: migration_20261004_083431_phase25c_commerce_offers.down,
    name: '20261004_083431_phase25c_commerce_offers',
  },
  {
    up: migration_20261004_091825_phase25d_cart_checkout_orders.up,
    down: migration_20261004_091825_phase25d_cart_checkout_orders.down,
    name: '20261004_091825_phase25d_cart_checkout_orders',
  },
  {
    up: migration_20261004_202041_phase26_content_system.up,
    down: migration_20261004_202041_phase26_content_system.down,
    name: '20261004_202041_phase26_content_system',
  },
  {
    up: migration_20261005_120000_phase30_return_insight_to_draft.up,
    down: migration_20261005_120000_phase30_return_insight_to_draft.down,
    name: '20261005_120000_phase30_return_insight_to_draft',
  },
  {
    up: migration_20261010_124616_phase30b_railway_storage.up,
    down: migration_20261010_124616_phase30b_railway_storage.down,
    name: '20261010_124616_phase30b_railway_storage'
  },
];
