import { supabase } from '@/integrations/supabase/client';
import type { ComplaintInsert } from '@/types/complaints';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, complaint } = req.body;

    if (!complaint) {
      return res.status(400).json({ message: 'Complaint is required' });
    }

    const complaintData: ComplaintInsert = {
      title: `Complaint from ${name || 'Anonymous'}`,
      description: complaint,
      submission_type: 'complaint',
      is_public: true,
      language: 'english',
      // Dummy/default values for required fields
      sector_id: '1', // Using a default sector ID
      user_name: name || 'Anonymous',
      email: null,
      state_id: null,
      district_id: null,
      date: new Date().toISOString().split('T')[0],
      attachments: [],
    };

    const { data, error } = await supabase
      .from('complaints')
      .insert(complaintData)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ 
      success: true, 
      message: 'Complaint submitted successfully',
      data 
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to submit complaint' 
    });
  }
} 