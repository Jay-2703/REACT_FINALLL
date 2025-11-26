import express from 'express';
import { requireAdmin, requireAdminOnly } from '../middleware/adminAuth.js';
import * as adminController from '../controllers/adminController.js';
import * as adminBookingController from '../controllers/adminBookingController.js';
import * as adminContentController from '../controllers/adminContentController.js';
import * as adminAnalyticsController from '../controllers/adminAnalyticsController.js';
import * as adminNotificationController from '../controllers/adminNotificationController.js';
import * as adminUsersController from '../controllers/adminUsersController.js';
import * as instructorController from '../controllers/instructorController.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardMetrics);

// Users Management - Statistics
router.get('/users/stats/total', adminUsersController.getTotalUsersCount);
router.get('/users/stats/active-today', adminUsersController.getActiveTodayCount);
router.get('/users/stats/new-this-month', adminUsersController.getNewThisMonthCount);

// Users Management - CRUD Operations
router.get('/users/export', adminUsersController.exportUsers);
router.get('/users/:userId', adminUsersController.getUserDetail);
router.get('/users', adminUsersController.getUsersList);
router.post('/users', requireAdminOnly, adminUsersController.createUser);
router.put('/users/:userId', requireAdminOnly, adminUsersController.updateUser);
router.delete('/users/:userId', requireAdminOnly, adminUsersController.deleteUser);
router.patch('/users/:userId/restore', requireAdminOnly, adminUsersController.restoreUser);
router.patch('/users/:userId/toggle-status', requireAdminOnly, adminUsersController.toggleUserStatus);

// Bookings Management
// IMPORTANT: Specific routes (/bookings/slots) must come BEFORE dynamic routes (/bookings/:id)
router.get('/bookings/slots', adminBookingController.getAvailableSlots);
router.get('/bookings', adminBookingController.getBookings);
router.post('/bookings', adminBookingController.createBooking);
router.put('/bookings/:id', adminBookingController.updateBooking);
router.delete('/bookings/:id', adminBookingController.deleteBooking);
router.post('/bookings/:id/confirm', adminBookingController.confirmBooking);
router.post('/bookings/:id/checkin', adminBookingController.checkInBooking);
router.post('/bookings/:id/complete', adminBookingController.completeBooking);

// Content Management - Modules
router.get('/modules', adminContentController.getModules);
router.post('/modules', requireAdminOnly, adminContentController.createModule);
router.put('/modules/:id', requireAdminOnly, adminContentController.updateModule);
router.delete('/modules/:id', requireAdminOnly, adminContentController.deleteModule);

// Content Management - Lessons
router.get('/lessons', adminContentController.getLessons);
router.post('/lessons', requireAdminOnly, adminContentController.createLesson);
router.put('/lessons/:id', requireAdminOnly, adminContentController.updateLesson);
router.delete('/lessons/:id', requireAdminOnly, adminContentController.deleteLesson);

// Content Management - Quizzes
router.get('/quizzes', adminContentController.getQuizzes);
router.post('/quizzes', requireAdminOnly, adminContentController.createQuiz);
router.put('/quizzes/:id', requireAdminOnly, adminContentController.updateQuiz);
router.delete('/quizzes/:id', requireAdminOnly, adminContentController.deleteQuiz);

// Analytics
router.get('/analytics', adminAnalyticsController.getAnalytics);

// Dashboard Statistics Endpoints
router.get('/dashboard/revenue', adminAnalyticsController.getDashboardRevenue);
router.get('/dashboard/appointments', adminAnalyticsController.getDashboardAppointments);
router.get('/dashboard/students', adminAnalyticsController.getDashboardStudents);
router.get('/dashboard/completion-rate', adminAnalyticsController.getDashboardCompletionRate);
router.get('/dashboard/revenue-trend', adminAnalyticsController.getRevenueTrend);
router.get('/dashboard/bookings-by-service', adminAnalyticsController.getBookingsByService);
router.get('/dashboard/user-segmentation', adminAnalyticsController.getUserSegmentation);
router.get('/dashboard/daily-active-users', adminAnalyticsController.getDailyActiveUsers);
router.get('/dashboard/top-students', adminAnalyticsController.getTopStudents);
router.get('/dashboard/recent-users', adminAnalyticsController.getRecentUsers);
router.get('/dashboard/new-registrations', adminAnalyticsController.getNewRegistrations);
router.get('/dashboard/todays-schedule', adminAnalyticsController.getTodaysSchedule);

// Reports
router.get('/reports/bookings', adminAnalyticsController.getBookingReport);
router.get('/reports/lessons', adminAnalyticsController.getLessonCompletionReport);
router.get('/reports/gamification', adminAnalyticsController.getGamificationReport);
router.get('/reports/transactions', adminAnalyticsController.getTransactionsReport);

// Notifications
router.get('/notifications', adminNotificationController.getNotifications);
router.post('/notifications', adminNotificationController.createAdminNotification);
router.put('/notifications/:id/read', adminNotificationController.markNotificationRead);
router.put('/notifications/read-all', adminNotificationController.markAllNotificationsRead);
router.get('/notifications/unread-count', adminNotificationController.getUnreadCount);

// Activity Logs
router.get('/activity-logs', adminNotificationController.getActivityLogs);

// Instructors Management
// IMPORTANT: Specific routes (/instructors/stats, /instructors/export, /instructors/bulk-action) must come BEFORE dynamic routes (/instructors/:id)
router.get('/instructors/stats', instructorController.getInstructorStats);
router.get('/instructors/export', instructorController.exportInstructors);
router.post('/instructors/bulk-action', requireAdminOnly, instructorController.bulkAction);
router.get('/instructors/:id/schedule', instructorController.getInstructorSchedule);
router.get('/instructors/:id/bookings', instructorController.getInstructorBookings);
router.get('/instructors/:id', instructorController.getInstructor);
router.get('/instructors', instructorController.getInstructors);
router.post('/instructors', requireAdminOnly, instructorController.createInstructor);
router.put('/instructors/:id', requireAdminOnly, instructorController.updateInstructor);
router.patch('/instructors/:id/availability', requireAdminOnly, instructorController.toggleAvailability);
router.delete('/instructors/:id', requireAdminOnly, instructorController.deleteInstructor);

// Payments & Billing Management
// IMPORTANT: Specific routes (/payments/summary, /payments/stats, /payments/export, /payments/bulk-action, /payments/services) must come BEFORE dynamic routes (/payments/:id)
router.get('/payments/test', paymentController.testDatabase);
router.get('/payments/summary', paymentController.getPaymentSummary);
router.get('/payments/stats', paymentController.getPaymentStats);
router.get('/payments/services', paymentController.getServices);
router.post('/payments/bulk-action', requireAdminOnly, paymentController.bulkAction);
router.get('/payments/export', paymentController.exportPayments);
router.get('/payments/:transactionId/details', paymentController.getPaymentDetails);
router.post('/payments/:transactionId/refund', requireAdminOnly, paymentController.processRefund);
router.patch('/payments/:transactionId/mark-paid', requireAdminOnly, paymentController.markAsPaid);
router.post('/payments/:transactionId/send-receipt', requireAdminOnly, paymentController.sendReceipt);
router.delete('/payments/:transactionId', requireAdminOnly, paymentController.deleteTransaction);
router.get('/payments/:transactionId', paymentController.getPaymentDetails);
router.get('/payments', paymentController.getPayments);
router.post('/payments', requireAdminOnly, paymentController.createTransaction);
router.get('/invoices/:invoiceId', paymentController.getInvoice);

export default router;