<?php

use App\Enums\UserRole;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Master\CompanyController;
use App\Http\Controllers\Master\ProductController;
use App\Http\Controllers\Master\StorageRowController;
use App\Http\Controllers\Master\UserController;
use App\Http\Controllers\Master\ValetController;
use App\Http\Controllers\ReceivingController;
use App\Http\Controllers\WarehouseMapController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landing')->name('home');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('warehouse-map', WarehouseMapController::class)->name('warehouse-map');

    Route::prefix('receiving')
        ->name('receiving.')
        ->middleware('role:'.UserRole::WarehouseOfficer->value.','.UserRole::Supervisor->value.','.UserRole::Admin->value)
        ->group(function () {
            Route::get('/', [ReceivingController::class, 'index'])->name('index');
            Route::get('/create', [ReceivingController::class, 'create'])->name('create');
            Route::post('/', [ReceivingController::class, 'store'])->name('store');
            Route::get('/{receiving}', [ReceivingController::class, 'show'])->name('show');
            Route::patch('/{receiving}/start', [ReceivingController::class, 'start'])->name('start');
            Route::patch('/{receiving}/finish', [ReceivingController::class, 'finish'])->name('finish');
            Route::patch('/{receiving}/lines/{line}/hold', [ReceivingController::class, 'holdBatch'])->name('lines.hold');
            Route::patch('/{receiving}/finalize', [ReceivingController::class, 'finalize'])->name('finalize');
        });

    Route::prefix('master')
        ->name('master.')
        ->middleware('role:'.UserRole::Admin->value)
        ->group(function () {
            Route::patch('companies/{company}/status', [CompanyController::class, 'updateStatus'])
                ->name('companies.status');
            Route::resource('companies', CompanyController::class)
                ->except(['show', 'destroy']);
            Route::patch('rows/{row}/status', [StorageRowController::class, 'updateStatus'])
                ->name('rows.status');
            Route::resource('rows', StorageRowController::class)
                ->except(['show', 'destroy']);
            Route::patch('valets/{valet}/status', [ValetController::class, 'updateStatus'])
                ->name('valets.status');
            Route::resource('valets', ValetController::class)
                ->except(['show', 'destroy']);
            Route::patch('users/{user}/status', [UserController::class, 'updateStatus'])
                ->name('users.status');
            Route::resource('users', UserController::class)
                ->except(['show', 'destroy']);
            Route::patch('products/{product}/status', [ProductController::class, 'updateStatus'])
                ->name('products.status');
            Route::resource('products', ProductController::class)
                ->except(['show', 'destroy']);
        });
});

require __DIR__.'/settings.php';
