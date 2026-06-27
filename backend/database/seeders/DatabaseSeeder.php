<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\CategoryTranslation;
use App\Models\Coupon;
use App\Models\Currency;
use App\Models\Language;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductTranslation;
use App\Models\Review;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedLanguages();
        $this->seedCurrencies();
        $this->seedCoupons();

        [$admin, $vendorUser, $customer] = $this->seedUsers();

        $vendors = $this->seedVendors($vendorUser);
        $categories = $this->seedCategories();
        $this->seedProducts($vendors, $categories, $customer);
    }

    private function seedLanguages(): void
    {
        $languages = [
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'is_rtl' => false, 'is_default' => true, 'sort_order' => 1],
            ['code' => 'ar', 'name' => 'Arabic', 'native_name' => 'العربية', 'is_rtl' => true, 'is_default' => false, 'sort_order' => 2],
            ['code' => 'fr', 'name' => 'French', 'native_name' => 'Français', 'is_rtl' => false, 'is_default' => false, 'sort_order' => 3],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(['code' => $language['code']], $language + ['is_active' => true]);
        }
    }

    private function seedCurrencies(): void
    {
        $currencies = [
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'symbol_position' => 'before', 'exchange_rate' => 1.000000, 'decimal_places' => 2, 'is_default' => true],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'symbol_position' => 'before', 'exchange_rate' => 0.920000, 'decimal_places' => 2, 'is_default' => false],
            ['code' => 'EGP', 'name' => 'Egyptian Pound', 'symbol' => 'ج.م', 'symbol_position' => 'after', 'exchange_rate' => 48.500000, 'decimal_places' => 2, 'is_default' => false],
            ['code' => 'SAR', 'name' => 'Saudi Riyal', 'symbol' => 'ر.س', 'symbol_position' => 'after', 'exchange_rate' => 3.750000, 'decimal_places' => 2, 'is_default' => false],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(['code' => $currency['code']], $currency + ['is_active' => true]);
        }
    }

    private function seedCoupons(): void
    {
        Coupon::updateOrCreate(['code' => 'WELCOME10'], [
            'type' => Coupon::TYPE_PERCENT,
            'value' => 10,
            'min_order_total' => 50,
            'usage_limit' => 1000,
            'is_active' => true,
        ]);

        Coupon::updateOrCreate(['code' => 'SAVE20'], [
            'type' => Coupon::TYPE_FIXED,
            'value' => 20,
            'min_order_total' => 100,
            'is_active' => true,
        ]);
    }

    /** @return array{0: User, 1: User, 2: User} */
    private function seedUsers(): array
    {
        $admin = User::updateOrCreate(['email' => 'admin@bazario.test'], [
            'name' => 'Platform Admin',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $vendorUser = User::updateOrCreate(['email' => 'vendor@bazario.test'], [
            'name' => 'Layla Hassan',
            'password' => Hash::make('password'),
            'role' => User::ROLE_VENDOR,
            'preferred_locale' => 'en',
            'preferred_currency' => 'USD',
            'is_active' => true,
        ]);

        $customer = User::updateOrCreate(['email' => 'customer@bazario.test'], [
            'name' => 'John Customer',
            'password' => Hash::make('password'),
            'role' => User::ROLE_CUSTOMER,
            'preferred_locale' => 'en',
            'preferred_currency' => 'USD',
            'is_active' => true,
        ]);

        return [$admin, $vendorUser, $customer];
    }

    /** @return array<int, Vendor> */
    private function seedVendors(User $vendorUser): array
    {
        $vendors = [];

        $vendors[] = Vendor::updateOrCreate(['slug' => 'aurora-electronics'], [
            'user_id' => $vendorUser->id,
            'store_name' => 'Aurora Electronics',
            'description' => 'Premium gadgets and smart devices from a trusted seller.',
            'base_currency' => 'USD',
            'commission_rate' => 8.5,
            'status' => Vendor::STATUS_APPROVED,
            'rating' => 4.7,
            'total_reviews' => 312,
            'country' => 'United States',
            'city' => 'San Francisco',
        ]);

        // A second vendor owned by the admin account for demo variety.
        $secondOwner = User::updateOrCreate(['email' => 'casa@bazario.test'], [
            'name' => 'Casa & Co.',
            'password' => Hash::make('password'),
            'role' => User::ROLE_VENDOR,
            'is_active' => true,
        ]);

        $vendors[] = Vendor::updateOrCreate(['slug' => 'casa-home-living'], [
            'user_id' => $secondOwner->id,
            'store_name' => 'Casa Home & Living',
            'description' => 'Beautiful, sustainable products for the modern home.',
            'base_currency' => 'EUR',
            'commission_rate' => 12,
            'status' => Vendor::STATUS_APPROVED,
            'rating' => 4.5,
            'total_reviews' => 198,
            'country' => 'France',
            'city' => 'Lyon',
        ]);

        return $vendors;
    }

    /** @return array<string, Category> */
    private function seedCategories(): array
    {
        $definitions = [
            'electronics' => [
                'icon' => 'cpu',
                'translations' => [
                    'en' => 'Electronics',
                    'ar' => 'الإلكترونيات',
                    'fr' => 'Électronique',
                ],
            ],
            'home-living' => [
                'icon' => 'home',
                'translations' => [
                    'en' => 'Home & Living',
                    'ar' => 'المنزل والمعيشة',
                    'fr' => 'Maison & Décoration',
                ],
            ],
            'fashion' => [
                'icon' => 'shirt',
                'translations' => [
                    'en' => 'Fashion',
                    'ar' => 'الموضة',
                    'fr' => 'Mode',
                ],
            ],
        ];

        $categories = [];

        foreach ($definitions as $slug => $def) {
            $category = Category::updateOrCreate(['slug' => $slug], [
                'icon' => $def['icon'],
                'is_active' => true,
            ]);

            foreach ($def['translations'] as $locale => $name) {
                CategoryTranslation::updateOrCreate(
                    ['category_id' => $category->id, 'locale' => $locale],
                    ['name' => $name]
                );
            }

            $categories[$slug] = $category;
        }

        return $categories;
    }

    /**
     * @param  array<int, Vendor>  $vendors
     * @param  array<string, Category>  $categories
     */
    private function seedProducts(array $vendors, array $categories, User $customer): void
    {
        $catalog = [
            [
                'vendor' => 0, 'category' => 'electronics', 'price' => 199.00, 'compare' => 249.00, 'currency' => 'USD', 'featured' => true,
                'names' => ['en' => 'Aurora Wireless Headphones', 'ar' => 'سماعات أورورا اللاسلكية', 'fr' => 'Casque sans fil Aurora'],
                'short' => ['en' => 'Immersive sound with active noise cancellation.', 'ar' => 'صوت غامر مع إلغاء الضوضاء النشط.', 'fr' => 'Son immersif avec réduction active du bruit.'],
            ],
            [
                'vendor' => 0, 'category' => 'electronics', 'price' => 89.00, 'compare' => null, 'currency' => 'USD', 'featured' => true,
                'names' => ['en' => 'SmartFit Watch Series 5', 'ar' => 'ساعة سمارت فيت الإصدار 5', 'fr' => 'Montre SmartFit Série 5'],
                'short' => ['en' => 'Track fitness, sleep and notifications.', 'ar' => 'تتبع اللياقة والنوم والإشعارات.', 'fr' => 'Suivez forme, sommeil et notifications.'],
            ],
            [
                'vendor' => 0, 'category' => 'electronics', 'price' => 45.00, 'compare' => 60.00, 'currency' => 'USD', 'featured' => false,
                'names' => ['en' => 'Portable Bluetooth Speaker', 'ar' => 'مكبر صوت بلوتوث محمول', 'fr' => 'Enceinte Bluetooth portable'],
                'short' => ['en' => 'Big sound in a pocket-sized design.', 'ar' => 'صوت كبير بتصميم بحجم الجيب.', 'fr' => 'Un grand son dans un format de poche.'],
            ],
            [
                'vendor' => 1, 'category' => 'home-living', 'price' => 34.90, 'compare' => null, 'currency' => 'EUR', 'featured' => true,
                'names' => ['en' => 'Handwoven Cotton Throw', 'ar' => 'بطانية قطنية منسوجة يدويًا', 'fr' => 'Plaid en coton tissé main'],
                'short' => ['en' => 'Soft, breathable and ethically made.', 'ar' => 'ناعمة وقابلة للتنفس ومصنوعة بشكل أخلاقي.', 'fr' => 'Doux, respirant et fabriqué de manière éthique.'],
            ],
            [
                'vendor' => 1, 'category' => 'home-living', 'price' => 59.00, 'compare' => 79.00, 'currency' => 'EUR', 'featured' => false,
                'names' => ['en' => 'Scandinavian Ceramic Lamp', 'ar' => 'مصباح سيراميك إسكندنافي', 'fr' => 'Lampe en céramique scandinave'],
                'short' => ['en' => 'Warm ambient light for any room.', 'ar' => 'إضاءة دافئة لأي غرفة.', 'fr' => 'Lumière chaleureuse pour chaque pièce.'],
            ],
            [
                'vendor' => 1, 'category' => 'fashion', 'price' => 24.00, 'compare' => null, 'currency' => 'EUR', 'featured' => false,
                'names' => ['en' => 'Organic Linen Tote Bag', 'ar' => 'حقيبة كتان عضوية', 'fr' => 'Sac cabas en lin biologique'],
                'short' => ['en' => 'Durable everyday carry, plastic-free.', 'ar' => 'حقيبة يومية متينة وخالية من البلاستيك.', 'fr' => 'Sac quotidien durable, sans plastique.'],
            ],
        ];

        foreach ($catalog as $i => $item) {
            $vendor = $vendors[$item['vendor']];
            $category = $categories[$item['category']];
            $slug = Str::slug($item['names']['en']);

            $product = Product::updateOrCreate(['slug' => $slug], [
                'vendor_id' => $vendor->id,
                'category_id' => $category->id,
                'sku' => 'BZR-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'price' => $item['price'],
                'compare_at_price' => $item['compare'],
                'currency' => $item['currency'],
                'stock' => random_int(15, 120),
                'in_stock' => true,
                'thumbnail' => "https://picsum.photos/seed/bazario{$i}/600/600",
                'rating' => round(random_int(40, 50) / 10, 1),
                'total_reviews' => random_int(5, 90),
                'total_sales' => random_int(10, 500),
                'is_active' => true,
                'is_featured' => $item['featured'],
            ]);

            foreach ($item['names'] as $locale => $name) {
                ProductTranslation::updateOrCreate(
                    ['product_id' => $product->id, 'locale' => $locale],
                    [
                        'name' => $name,
                        'short_description' => $item['short'][$locale] ?? null,
                        'description' => ($item['short'][$locale] ?? $name).' '.($item['short'][$locale] ?? ''),
                    ]
                );
            }

            // A couple of gallery images per product.
            for ($g = 0; $g < 3; $g++) {
                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'url' => "https://picsum.photos/seed/bazario{$i}-{$g}/800/800"],
                    ['alt' => $item['names']['en'], 'sort_order' => $g]
                );
            }

            // One demo review from the customer on the first product.
            if ($i === 0) {
                Review::updateOrCreate(
                    ['product_id' => $product->id, 'user_id' => $customer->id],
                    ['rating' => 5, 'title' => 'Excellent!', 'body' => 'Sound quality is amazing and battery lasts for days.', 'is_approved' => true]
                );
            }
        }

        // Give the customer a demo cart with one item.
        $firstProduct = Product::first();
        if ($firstProduct) {
            $cart = Cart::updateOrCreate(['user_id' => $customer->id], []);
            CartItem::updateOrCreate(
                ['cart_id' => $cart->id, 'product_id' => $firstProduct->id],
                ['quantity' => 1, 'unit_price' => $firstProduct->price]
            );
        }
    }
}
