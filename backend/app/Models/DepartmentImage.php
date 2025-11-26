<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'image_path',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function getImageUrlAttribute()
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
