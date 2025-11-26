<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Committee extends Model
{
    use HasFactory;

    protected $fillable = [
        'committee_title',
        'committee_description',
        'status'
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function members()
    {
        return $this->hasMany(CommitteeMember::class);
    }
}
