<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutCollege extends Model
{
    use HasFactory;

    protected $table = 'about_college';


    protected $fillable = [
        'name',
        'description',
        'location',
        'established',
        'affiliations',
        'highlights',
    ];

    protected $casts = [
        'affiliations' => 'array',
        'highlights' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function images()
    {
        return $this->hasMany(CollegeImage::class, 'college_id')->orderBy('display_order');
    }

    public function getFirstImageAttribute()
    {
        return $this->images()->first()?->image_path;
    }

    public function getImageUrlsAttribute()
    {
        return $this->images->pluck('image_path')->toArray();
    }
}
