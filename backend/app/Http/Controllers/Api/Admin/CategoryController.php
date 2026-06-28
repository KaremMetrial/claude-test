<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminCategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->with('translations')
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return AdminCategoryResource::collection($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateData($request);
        $category = $this->save($request, $data, new Category());

        return response()->json([
            'message' => __('Category created.'),
            'data' => (new AdminCategoryResource($category->load('translations')->loadCount('products')))->resolve(),
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $this->validateData($request, $category);
        $category = $this->save($request, $data, $category);

        return response()->json([
            'message' => __('Category updated.'),
            'data' => (new AdminCategoryResource($category->load('translations')->loadCount('products')))->resolve(),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => __('Category deleted.')]);
    }

    private function validateData(Request $request, ?Category $category = null): array
    {
        $fallback = (string) config('app.fallback_locale', 'en');

        return $request->validate([
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => ['nullable', 'string', 'max:64'],
            'image' => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'translations' => ['required', 'array'],
            "translations.{$fallback}.name" => ['required', 'string', 'max:255'],
            'translations.*.name' => ['nullable', 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string', 'max:2000'],
        ]);
    }

    private function save(Request $request, array $data, Category $category): Category
    {
        $supported = (array) config('app.supported_locales', ['en']);
        $fallback = (string) config('app.fallback_locale', 'en');
        $translations = collect($data['translations'])->only($supported)->filter(fn ($t) => ! empty($t['name']));
        $primaryName = $translations[$fallback]['name'] ?? $translations->first()['name'];

        return DB::transaction(function () use ($request, $data, $category, $translations, $primaryName) {
            $category->fill([
                'parent_id' => $data['parent_id'] ?? null,
                'icon' => $data['icon'] ?? null,
                'image' => $data['image'] ?? null,
                'is_active' => $request->boolean('is_active', true),
                'sort_order' => $data['sort_order'] ?? 0,
            ]);

            if (! $category->slug) {
                $category->slug = $this->uniqueSlug($primaryName);
            }

            $category->save();

            foreach ($translations as $locale => $fields) {
                $category->translations()->updateOrCreate(
                    ['locale' => $locale],
                    ['name' => $fields['name'], 'description' => $fields['description'] ?? null]
                );
            }

            return $category;
        });
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $n = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$n);
        }

        return $slug;
    }
}
