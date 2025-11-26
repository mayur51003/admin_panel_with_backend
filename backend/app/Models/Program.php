<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'program_title',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function curriculums()
    {
        return $this->hasMany(Curriculum::class);
    }
}
