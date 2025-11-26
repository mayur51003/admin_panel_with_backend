<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_name',
        'tagline',
        'about',
        'status',
    ];

    protected $cast = [
        'status' => 'string',
    ];

    public function hod()
    {
        return $this->hasOne(DepartmentHod::class);
    }

    public function previousHods()
    {
        return $this->hasMany(PreviousHod::class);
    }

    public function faculties()
    {
        return $this->hasMany(DepartmentFaculty::class);
    }

    public function courses()
    {
        return $this->hasMany(DepartmentCourse::class);
    }

    public function valueAddedPrograms()
    {
        return $this->hasMany(DepartmentValueAddedProgram::class);
    }

    public function images()
    {
        return $this->hasMany(DepartmentImage::class)->orderBy('sort_order');
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
