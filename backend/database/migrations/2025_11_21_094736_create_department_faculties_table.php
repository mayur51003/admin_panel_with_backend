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
        Schema::create('department_faculties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->string('faculty_name');
            $table->string('faculty_email');
            $table->date('faculty_dob');
            $table->integer('faculty_industrial_exp')->default(0);
            $table->integer('faculty_teaching_exp')->default(0);
            $table->text('course_taught');
            $table->string('designation');
            $table->date('faculty_joining_date');
            $table->string('qualification');
            $table->string('faculty_photo')->nullable();
            $table->string('nature_of_association')->nullable();
            $table->text('achievements')->nullable();
            $table->longText('additional_info')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('department_faculties');
    }
};
