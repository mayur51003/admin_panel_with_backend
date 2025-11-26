<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreviousHod extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'previous_hod_name',
        'previous_hod_tenure',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
