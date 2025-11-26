<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_title',
    ];

    public function programs()
    {
        return $this->hasmany(Program::class);
    }

    public function curriculums()
    {
        return $this->hasMany(Curriculum::class);
    }
}
