<?php

use App\Http\Controllers\AboutCollegeController;
use App\Http\Controllers\AcademicController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommitteeController;
use App\Http\Controllers\CommitteeMemberController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DepartmentCourseController;
use App\Http\Controllers\DepartmentFacultyController;
use App\Http\Controllers\DepartmentHodController;
use App\Http\Controllers\DepartmentImageController;
use App\Http\Controllers\DepartmentValueAddedProgramController;
use App\Http\Controllers\MissionVisionController;
use App\Http\Controllers\PreviousHodController;
use App\Http\Controllers\PrincipalController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SurveyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/students', [StudentController::class, 'index']);
Route::get('/students/{id}', [StudentController::class, 'show']);
Route::post('/students', [StudentController::class, 'store']);
Route::put('/students/{id}', [StudentController::class, 'update']);
Route::delete('/students/{id}', [StudentController::class, 'destroy']);
Route::get('/students/statistics/dashboard', [StudentController::class, 'statistics']);

Route::get('/principals', [PrincipalController::class, 'index']);
Route::post('/principals', [PrincipalController::class, 'store']);
Route::delete('/principals/{id}', [PrincipalController::class, 'destroy']);
Route::put('/principals/{id}', [PrincipalController::class, 'update']);

Route::get('/aboutCollege', [AboutCollegeController::class, 'getCollege']);
Route::post('/aboutCollege', [AboutCollegeController::class, 'store']);
Route::put('/aboutCollege', [AboutCollegeController::class, 'update']);

Route::delete('/college-image/{imageId}', [AboutCollegeController::class, 'deleteImage']);
Route::put('/college-image/{imageId}', [AboutCollegeController::class, 'updateImage']);


Route::get('/mission-vision', [MissionVisionController::class, 'get']);
Route::post('/mission-vision', [MissionVisionController::class, 'storeOrUpdate']);


Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);


Route::get('/programs', [ProgramController::class, 'index']);
Route::post('/programs', [ProgramController::class, 'store']);
Route::get('/programs/{id}', [ProgramController::class, 'show']);
Route::put('/programs/{id}', [ProgramController::class, 'update']);
Route::delete('/programs/{id}', [ProgramController::class, 'destroy']);


Route::get('/curriculums', [CurriculumController::class, 'index']);
Route::post('/curriculums', [CurriculumController::class, 'store']);
Route::get('/curriculums/{id}', [CurriculumController::class, 'show']);
Route::put('/curriculums/{id}', [CurriculumController::class, 'update']);
Route::delete('/curriculums/{id}', [CurriculumController::class, 'destroy']);


Route::get('/academics', [AcademicController::class, 'index']);
Route::post('/academics', [AcademicController::class, 'store']);
Route::get('/academics/{id}', [AcademicController::class, 'show']);
Route::put('/academics/{id}', [AcademicController::class, 'update']);
Route::delete('/academics/{id}', [AcademicController::class, 'destroy']);

Route::get('/surveys', [SurveyController::class, 'index']);
Route::post('/surveys', [SurveyController::class, 'store']);
Route::get('/surveys/{id}', [SurveyController::class, 'show']);
Route::put('/surveys/{id}', [SurveyController::class, 'update']);
Route::delete('/surveys/{id}', [SurveyController::class, 'destroy']);

Route::get('/committees', [CommitteeController::class, 'index']);
Route::post('/committees', [CommitteeController::class, 'store']);
Route::get('/committees/{id}', [CommitteeController::class, 'show']);
Route::put('/committees/{id}', [CommitteeController::class, 'update']);
Route::delete('/committees/{id}', [CommitteeController::class, 'destroy']);

Route::get('/committee-members', [CommitteeMemberController::class, 'index']);
Route::post('/committee-members', [CommitteeMemberController::class, 'store']);
Route::get('/committee-members/{id}', [CommitteeMemberController::class, 'show']);
Route::put('/committee-members/{id}', [CommitteeMemberController::class, 'update']);
Route::delete('/committee-members/{id}', [CommitteeMemberController::class, 'destroy']);

Route::get('/departments', [DepartmentController::class, 'index']);
Route::post('/departments', [DepartmentController::class, 'store']);
Route::get('/departments/{department}', [DepartmentController::class, 'show']);
Route::put('/departments/{department}', [DepartmentController::class, 'update']);
Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

Route::get('/department-hods', [DepartmentHodController::class, 'index']);
Route::post('/departments/{department}/hod', [DepartmentHodController::class, 'store']);
Route::put('/departments/{department}/hod/{hod}', [DepartmentHodController::class, 'update']);
Route::delete('/departments/{department}/hod/{hod}', [DepartmentHodController::class, 'destroy']);


Route::get('/departments/{department}/previous-hods', [PreviousHodController::class, 'index']);
Route::post('/departments/{department}/previous-hods', [PreviousHodController::class, 'store']);
Route::put('/departments/{department}/previous-hods/{previousHod}', [PreviousHodController::class, 'update']);
Route::delete('/departments/{department}/previous-hods/{previousHod}', [PreviousHodController::class, 'destroy']);

Route::get('/departments/{department}/faculties', [DepartmentFacultyController::class, 'index']);
Route::post('/departments/{department}/faculties', [DepartmentFacultyController::class, 'store']);
Route::put('/departments/{department}/faculties/{faculty}', [DepartmentFacultyController::class, 'update']);
Route::delete('/departments/{department}/faculties/{faculty}', [DepartmentFacultyController::class, 'destroy']);

Route::get('/departments/{department}/courses', [DepartmentCourseController::class, 'index']);
Route::post('/departments/{department}/courses', [DepartmentCourseController::class, 'store']);
Route::put('/departments/{department}/courses/{course}', [DepartmentCourseController::class, 'update']);
Route::delete('/departments/{department}/courses/{course}', [DepartmentCourseController::class, 'destroy']);

Route::get('/departments/{department}/value-added-programs', [DepartmentValueAddedProgramController::class, 'index']);
Route::post('/departments/{department}/value-added-programs', [DepartmentValueAddedProgramController::class, 'store']);
Route::put('/departments/{department}/value-added-programs/{program}', [DepartmentValueAddedProgramController::class, 'update']);
Route::delete('/departments/{department}/value-added-programs/{program}', [DepartmentValueAddedProgramController::class, 'destroy']);

Route::get('/departments/{department}/images', [DepartmentImageController::class, 'index']);
Route::post('/departments/{department}/images', [DepartmentImageController::class, 'store']);
Route::put('/departments/{department}/images/{image}', [DepartmentImageController::class, 'update']);
Route::delete('/departments/{department}/images/{image}', [DepartmentImageController::class, 'destroy']);
Route::post('/departments/{department}/images/reorder', [DepartmentImageController::class, 'updateOrder']);
