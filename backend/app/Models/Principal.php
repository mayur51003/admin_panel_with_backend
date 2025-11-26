<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Principal extends Model
{
    use HasFactory;

    protected $table = 'principal';
    protected $appends = ['photo_url'];

    protected $fillable = [
        'name',
        'designation',
        'photo_path',
        'joining_date',
        'end_date',
        'quote',
        'message',
    ];

    public function getPhotoUrlAttribute()
    {
        return $this->photo_path ? asset('storage/' . $this->photo_path) : null;
    }
}
