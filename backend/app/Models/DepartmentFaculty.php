<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentFaculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'faculty_name',
        'faculty_email',
        'faculty_dob',
        'faculty_industrial_exp',
        'faculty_teaching_exp',
        'course_taught',
        'designation',
        'faculty_joining_date',
        'qualification',
        'faculty_photo',
        'nature_of_association',
        'achievements',
        'additional_info',
    ];

    protected $casts = [
        'faculty_dob' => 'date',
        'faculty_joining_date' => 'date',
        'faculty_industrial_exp' => 'integer',
        'faculty_teaching_exp' => 'integer',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function getPhotoUrlAttribute()
    {
        return $this->faculty_photo ? asset('storage/' . $this->faculty_photo) : null;
    }

    public function getCoursesArrayAttribute()
    {
        return $this->course_taught ? explode(', ', $this->course_taught) : [];
    }

    public function getTotalExperienceAttribute()
    {
        return $this->faculty_teaching_exp + $this->faculty_industrial_exp;
    }
}
