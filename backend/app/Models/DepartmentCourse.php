<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentCourse extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'course_title',
        'duration_in_month_or_years',
        'intake_capacity',
    ];

    protected $casts = [
        'duration_in_month_or_years' => 'integer',
        'intake_capacity' => 'integer',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function getDurationFormattedAttribute()
    {
        $duration = $this->duration_in_month_or_years;

        if ($duration < 12) {
            return $duration . ' month' . ($duration > 1 ? 's' : '');
        }

        $years = floor($duration / 12);
        $months = $duration % 12;

        $formatted = $years . ' year' . ($years > 1 ? 's' : '');

        if ($months > 0) {
            $formatted .= ' ' . $months . ' month' . ($months > 1 ? 's' : '');
        }

        return $formatted;
    }
}
