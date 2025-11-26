<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'committee_id',
        'member_name',
        'designation',
        'qualification',
        'email',
        'phone',
        'photo',
    ];

    public function committee()
    {
        return $this->belongsTo(Committee::class);
    }
}
