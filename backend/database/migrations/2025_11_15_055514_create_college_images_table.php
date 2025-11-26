<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('college_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('college_id')
                ->constrained('about_college')
                ->onDelete('cascade');
            $table->string('image_path');
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['college_id', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('college_images');
    }
};
