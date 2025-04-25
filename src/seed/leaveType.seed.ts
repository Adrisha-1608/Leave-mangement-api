import LeaveType from '../models/leaveType.model';

// Seed Leave Types
const seedLeaveTypes = async () => {
  try {
    const existingLeaveTypes = await LeaveType.find();

    if (existingLeaveTypes.length > 0) {
      console.log('Leave types are already seeded.');
      return;
    }
    const leaveTypes = [
      {
        leaveType: 'Planned Leave',
        description: 'Leave for planned vacation or time off',
      },
      {
        leaveType: 'Emergency Leave',
        description: 'Leave for urgent or unexpected situations',
      },
    ];
    await LeaveType.insertMany(leaveTypes);
    console.log('Leave types seeded successfully');
  } catch (err) {
    console.error('Error seeding leave types:', err);
  }
};

export default seedLeaveTypes;
