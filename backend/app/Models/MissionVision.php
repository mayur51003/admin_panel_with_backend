<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MissionVision extends Model
{
    use HasFactory;

    protected $table = 'mission_vision';

    protected $fillable = [
        'mission',
        'vision'
    ];
}
