<?php

namespace Database\Seeders;

use App\Models\AppraisalCycle;
use App\Models\Criteria;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User', 'email' => 'admin@example.com',
            'password' => Hash::make('password'), 'role' => 'admin',
            'department' => 'HR', 'position' => 'HR Director',
        ]);

        $manager1 = User::create([
            'name' => 'Sarah Johnson', 'email' => 'sarah@example.com',
            'password' => Hash::make('password'), 'role' => 'manager',
            'department' => 'Engineering', 'position' => 'Engineering Manager',
        ]);

        $manager2 = User::create([
            'name' => 'Mark Davis', 'email' => 'mark@example.com',
            'password' => Hash::make('password'), 'role' => 'manager',
            'department' => 'Marketing', 'position' => 'Marketing Manager',
        ]);

        $employees = [
            ['name' => 'Alice Chen',   'email' => 'alice@example.com',  'dept' => 'Engineering', 'pos' => 'Software Engineer',  'mgr' => $manager1->id],
            ['name' => 'Bob Williams', 'email' => 'bob@example.com',    'dept' => 'Engineering', 'pos' => 'Senior Developer',   'mgr' => $manager1->id],
            ['name' => 'Carol Smith',  'email' => 'carol@example.com',  'dept' => 'Marketing',   'pos' => 'Marketing Analyst',  'mgr' => $manager2->id],
            ['name' => 'David Lee',    'email' => 'david@example.com',  'dept' => 'Marketing',   'pos' => 'Content Strategist', 'mgr' => $manager2->id],
        ];

        foreach ($employees as $emp) {
            User::create([
                'name' => $emp['name'], 'email' => $emp['email'],
                'password' => Hash::make('password'), 'role' => 'employee',
                'department' => $emp['dept'], 'position' => $emp['pos'],
                'manager_id' => $emp['mgr'],
            ]);
        }

        AppraisalCycle::create([
            'name' => 'Annual Review 2025', 'year' => 2025,
            'start_date' => '2025-01-01', 'end_date' => '2025-12-31',
            'status' => 'active', 'description' => 'Annual performance review for fiscal year 2025.',
        ]);

        $criteriaData = [
            ['name' => 'Job Knowledge',       'category' => 'Performance', 'description' => 'Understanding of job duties and required skills.',  'weight' => 20],
            ['name' => 'Quality of Work',     'category' => 'Performance', 'description' => 'Accuracy, thoroughness and reliability of output.', 'weight' => 20],
            ['name' => 'Communication',       'category' => 'Behaviour',   'description' => 'Written and verbal communication effectiveness.',   'weight' => 15],
            ['name' => 'Teamwork',            'category' => 'Behaviour',   'description' => 'Collaboration and support for colleagues.',         'weight' => 15],
            ['name' => 'Initiative',          'category' => 'Behaviour',   'description' => 'Proactively identifies and solves problems.',       'weight' => 10],
            ['name' => 'Attendance & Punctuality', 'category' => 'Conduct','description' => 'Reliability and time management.',                 'weight' => 10],
            ['name' => 'Leadership',          'category' => 'Development', 'description' => 'Ability to guide and motivate others.',            'weight' => 10],
        ];

        foreach ($criteriaData as $data) {
            Criteria::create(array_merge($data, ['max_score' => 5, 'is_active' => true]));
        }
    }
}
