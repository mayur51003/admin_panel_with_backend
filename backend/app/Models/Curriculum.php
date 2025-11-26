<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    use HasFactory;

    protected $table = 'curriculums';

    protected $fillable = [
        'category_id',
        'program_id',
        'session',
        'year',
        'pdf_path',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
