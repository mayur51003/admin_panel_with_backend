<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentValueAddedProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'value_added_program_title',
        'co_ordinator_name',
        'intake_capacity',
        'duration_in_months',
    ];

    protected $casts = [
        'intake_capacity' => 'integer',
        'duration_in_months' => 'integer',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function getDurationFormattedAttribute()
    {
        $months = $this->duration_in_months;
        return $months . ' month' . ($months > 1 ? 's' : '');
    }
}
