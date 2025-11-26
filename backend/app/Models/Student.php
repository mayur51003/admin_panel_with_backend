<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'age',
        'classroom_id',
        'roll_no',
        'email',
    ];

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function marks()
    {
        return $this->hasMany(Mark::class);
    }
}
