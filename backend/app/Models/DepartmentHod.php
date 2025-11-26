<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentHod extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'hod_name',
        'qualification',
        'description',
        'photo',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }
}
