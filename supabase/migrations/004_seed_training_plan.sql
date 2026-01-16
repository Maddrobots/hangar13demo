-- Seed default training plan with first 10 weeks
-- Insert the default training plan
INSERT INTO public.training_plans (id, name, description, total_weeks, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Aviation Maintenance Technician - Standard Program',
    'Standard 130-week training program for Aviation Maintenance Technicians covering safety, ground operations, systems, and advanced maintenance procedures.',
    130,
    TRUE
)
ON CONFLICT DO NOTHING;

-- Week 1: Safety, Ground Operations & Servicing
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 1,
    'Safety, Ground Operations & Servicing', '12',
    ARRAY[
        'Understand the fundamental safety protocols in aviation maintenance',
        'Identify personal protective equipment (PPE) requirements',
        'Learn proper ground handling procedures for aircraft',
        'Understand fuel servicing safety requirements'
    ],
    'Chapter 1 of the Aviation Maintenance Technician Handbook covers essential safety practices. Focus on hazard identification, emergency procedures, and the importance of maintaining a safe work environment. Review FAA AC 43.13-1B for standard practices.',
    'Shadow your mentor during ground operations. Focus on observing how they prepare the work area, use PPE, and follow lockout/tagout procedures.',
    ARRAY[
        'What are the most common safety hazards you''ve observed in our hangar?',
        'How do you ensure proper grounding when servicing aircraft?',
        'What''s the procedure if you discover a fuel leak during servicing?'
    ],
    'Document at least 3 safety protocols you observed or practiced this week. Include photos if possible.'
);

-- Week 2: Aircraft Documentation and Record Keeping
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 2,
    'Aircraft Documentation and Record Keeping', '00',
    ARRAY[
        'Understand the importance of accurate aircraft documentation',
        'Learn to read and interpret maintenance logs and records',
        'Identify required entries in maintenance documentation',
        'Understand regulatory requirements for record keeping'
    ],
    'Review FAA regulations on aircraft maintenance records (14 CFR Part 91, 135, 121). Study examples of properly completed logbook entries and understand the difference between routine maintenance, inspections, and repairs.',
    'Practice reviewing actual aircraft logbooks under mentor supervision. Learn to identify required entries and spot incomplete or incorrect documentation.',
    ARRAY[
        'What information must be included in every maintenance log entry?',
        'How do you determine when an inspection is due?',
        'What happens if you find incomplete documentation in an aircraft log?'
    ],
    'Complete a practice logbook entry for a maintenance task you observed. Have your mentor review it for accuracy and completeness.'
);

-- Week 3: Tool Management and Calibration
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 3,
    'Tool Management and Calibration', '20',
    ARRAY[
        'Identify standard aviation maintenance tools',
        'Understand tool calibration requirements and schedules',
        'Learn proper tool storage and organization',
        'Recognize when tools require calibration or replacement'
    ],
    'Study the tool calibration requirements outlined in AC 43.13-1B. Review tool control procedures and learn about calibrated vs. uncalibrated tool usage. Understand torque wrench calibration requirements.',
    'Participate in tool inventory and calibration checks. Learn to use calibration tracking systems and identify tools that need service.',
    ARRAY[
        'How often should torque wrenches be calibrated?',
        'What are the consequences of using uncalibrated tools?',
        'How do you track tool calibration in our facility?'
    ],
    'Create a checklist for tool inspection and identify any tools in your assigned area that need calibration. Document the process.'
);

-- Week 4: Aircraft Hardware and Fasteners
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 4,
    'Aircraft Hardware and Fasteners', '20',
    ARRAY[
        'Identify common aircraft fasteners and their applications',
        'Understand thread standards (AN, MS, NAS)',
        'Learn proper torque application and installation procedures',
        'Recognize when fasteners need replacement'
    ],
    'Study AN960 washers, AN bolts, MS fasteners, and self-locking nuts. Review torque tables and installation procedures. Learn about cotter pins and safety wire applications.',
    'Practice installing and removing various fasteners under supervision. Learn to read fastener part numbers and determine proper torque values.',
    ARRAY[
        'How do you determine the correct fastener for a specific application?',
        'What is the difference between AN and MS hardware?',
        'When must fasteners be replaced rather than reused?'
    ],
    'Complete a fastener identification exercise: identify 10 different fasteners and explain their proper applications. Include photos with labels.'
);

-- Week 5: Aircraft Weight and Balance
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 5,
    'Aircraft Weight and Balance', '08',
    ARRAY[
        'Understand the importance of weight and balance calculations',
        'Learn to read weight and balance data plates',
        'Calculate center of gravity (CG) for simple configurations',
        'Recognize weight and balance limitations'
    ],
    'Study aircraft weight and balance manuals. Learn to interpret loading graphs and understand how modifications affect weight and balance. Review CG calculations and envelope limits.',
    'Observe or participate in aircraft weighing procedures. Practice calculating CG for different loading scenarios using actual aircraft data.',
    ARRAY[
        'How does fuel burn affect an aircraft''s center of gravity?',
        'What information is required to calculate weight and balance?',
        'What are the consequences of operating outside the CG envelope?'
    ],
    'Calculate the weight and balance for a hypothetical loading scenario using data from an actual aircraft in our facility. Show all calculations.'
);

-- Week 6: Fluid Systems - Hydraulics
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 6,
    'Fluid Systems - Hydraulics', '29',
    ARRAY[
        'Understand basic hydraulic system principles',
        'Identify hydraulic system components (pumps, actuators, valves)',
        'Learn proper hydraulic fluid handling and contamination control',
        'Recognize common hydraulic system failures'
    ],
    'Study hydraulic system schematics and component function. Review hydraulic fluid specifications and contamination control procedures. Learn about pressure testing and leak detection.',
    'Inspect hydraulic system components during routine maintenance. Practice fluid sampling and contamination checks. Observe hydraulic system operation and troubleshooting.',
    ARRAY[
        'What are the most common causes of hydraulic system contamination?',
        'How do you determine if hydraulic fluid needs replacement?',
        'What safety precautions are required when working with pressurized hydraulic systems?'
    ],
    'Document the hydraulic system inspection procedure. Identify any discrepancies found and explain the corrective action required.'
);

-- Week 7: Fuel Systems
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 7,
    'Fuel Systems', '28',
    ARRAY[
        'Identify fuel system components and their functions',
        'Understand fuel quality requirements and testing procedures',
        'Learn proper fuel handling and storage practices',
        'Recognize fuel system leak detection and repair procedures'
    ],
    'Study fuel system diagrams and component locations. Review fuel quality standards (ASTM D1655) and contamination detection. Learn about fuel system inspections and leak testing.',
    'Participate in fuel system inspections and fuel sampling procedures. Observe fuel handling operations and learn contamination prevention techniques.',
    ARRAY[
        'What are the requirements for fuel quality testing?',
        'How do you detect water contamination in fuel?',
        'What is the procedure for dealing with a fuel leak?'
    ],
    'Document a fuel system inspection process. Include photos of key components and explain what you''re checking for during inspection.'
);

-- Week 8: Electrical Systems Fundamentals
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 8,
    'Electrical Systems Fundamentals', '24',
    ARRAY[
        'Understand basic electrical principles (voltage, current, resistance)',
        'Read electrical wiring diagrams and schematics',
        'Identify common aircraft electrical components',
        'Learn proper wire installation and termination procedures'
    ],
    'Study electrical system theory and Ohm''s law. Review wiring diagram symbols and circuit interpretation. Learn about wire sizing, circuit protection, and electrical safety.',
    'Practice reading aircraft electrical diagrams. Observe wire routing and installation procedures. Learn to use multimeters and continuity testers safely.',
    ARRAY[
        'How do you determine the correct wire size for a given application?',
        'What are the requirements for wire installation and routing?',
        'How do you troubleshoot an electrical circuit that''s not working?'
    ],
    'Identify and trace a complete electrical circuit from the diagram. Document the circuit path and explain the function of each component.'
);

-- Week 9: Landing Gear Systems
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 9,
    'Landing Gear Systems', '32',
    ARRAY[
        'Identify landing gear system components',
        'Understand landing gear retraction and extension systems',
        'Learn proper tire and brake inspection procedures',
        'Recognize common landing gear maintenance tasks'
    ],
    'Study landing gear system operation and components. Review tire maintenance, pressure requirements, and wear limits. Learn about brake inspection and overhaul procedures.',
    'Participate in landing gear inspections and tire changes. Observe landing gear operation tests and learn proper jacking procedures for gear maintenance.',
    ARRAY[
        'What are the requirements for tire inspection and replacement?',
        'How do you properly jack an aircraft for landing gear work?',
        'What checks must be performed after landing gear maintenance?'
    ],
    'Document a landing gear inspection procedure. Include tire pressure checks, wear measurements, and any discrepancies found.'
);

-- Week 10: Engine Fundamentals
INSERT INTO public.training_plan_weeks (
    training_plan_id, week_number, title, ata_chapter,
    learning_objectives, study_materials, practical_application,
    mentor_discussion_questions, weekly_deliverable
) VALUES (
    '00000000-0000-0000-0000-000000000001', 10,
    'Engine Fundamentals', '72-80',
    ARRAY[
        'Understand basic engine operating principles',
        'Identify major engine components and their functions',
        'Learn proper engine inspection procedures',
        'Recognize common engine maintenance tasks and requirements'
    ],
    'Study engine theory and operation (reciprocating and/or turbine, depending on facility). Review engine inspection requirements and maintenance intervals. Learn about engine oil analysis and condition monitoring.',
    'Participate in engine inspections under mentor supervision. Observe oil changes, filter replacements, and other routine engine maintenance tasks.',
    ARRAY[
        'What are the key items to check during an engine inspection?',
        'How do you interpret engine oil analysis results?',
        'What maintenance tasks are required at specific engine hour intervals?'
    ],
    'Document an engine inspection process. Include inspection points, acceptable limits, and explain any discrepancies or findings.'
);

-- Set the default training plan for any existing apprentices without one
UPDATE public.apprentices
SET training_plan_id = '00000000-0000-0000-0000-000000000001'
WHERE training_plan_id IS NULL;
