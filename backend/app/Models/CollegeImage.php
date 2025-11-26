<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollegeImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'college_id',
        'image_path',
        'display_order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function college()
    {
        return $this->belongsTo(AboutCollege::class, 'college_id');
    }
}
