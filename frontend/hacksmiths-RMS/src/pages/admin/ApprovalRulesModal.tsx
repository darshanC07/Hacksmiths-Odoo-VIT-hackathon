import React, { useState } from 'react';
import { saveApprovalRules } from '../../Global Api/globalApi';
import './ApprovalRules.css';

interface User {
  id?: number | string;
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  manager?: string;
  manager_uid?: string;
  status?: string;
}

interface Approver {
  uid: string;
  isMandatory: boolean;
}

interface ApprovalRulesModalProps {
  user: User;
  allUsers: User[];
  onClose: () => void;
}

const ApprovalRulesModal: React.FC<ApprovalRulesModalProps> = ({ user, allUsers, onClose }) => {
  // Identify current manager logically from user standard
  const currentManagerUid = user.manager || user.manager_uid || '';

  // Form State Architecture
  const [description, setDescription] = useState('Approval rule for miscellaneous expenses');
  const [managerUid, setManagerUid] = useState(currentManagerUid);
  const [isManagerApprover, setIsManagerApprover] = useState(true);
  
  const [approvers, setApprovers] = useState<Approver[]>([
    { uid: '', isMandatory: true }
  ]);
  
  const [isSequenceRequired, setIsSequenceRequired] = useState(false);
  const [minApprovalPercent, setMinApprovalPercent] = useState<number>(100);

  const handleAddApprover = () => {
    setApprovers([...approvers, { uid: '', isMandatory: false }]);
  };

  const handleRemoveApprover = (idx: number) => {
    const updated = [...approvers];
    updated.splice(idx, 1);
    setApprovers(updated);
  };

  const handleApproverChange = (idx: number, field: keyof Approver, value: any) => {
    const updated = [...approvers];
    updated[idx] = { ...updated[idx], [field]: value };
    setApprovers(updated);
  };

  const handleSave = async () => {
    const rulePayload = {
      user_uid: user.uid,
      description: description,
      is_manager_approver: isManagerApprover,
      approvers: approvers.filter(a => a.uid !== ''), 
      min_approval_percentage: minApprovalPercent
    };

    try {
      await saveApprovalRules(rulePayload);
      alert(`Approval Rules for ${user.name || 'user'} successfully saved directly to Firebase!`);
      onClose();
    } catch (err: any) {
      console.error("Failed to save rules:", err);
      alert(err?.response?.data?.error || "Failed to reach the backend to save generated rules.");
    }
  };

  // Only show users with 'Manager' role in the left manager dropdown
  const potentialManagers = allUsers.filter(u => u.role === 'Manager');

  return (
    <div className="approval-modal-overlay" onClick={onClose}>
      <div className="approval-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <header className="approval-modal-header">
          <h3>Admin view (Approval rules)</h3>
          <button className="approval-modal-close" onClick={onClose}>&times;</button>
        </header>

        <div className="approval-modal-body">
          {/* LEFT COLUMN: User & Meta Logic */}
          <div className="approval-left">
            <div className="approval-form-group">
              <label>User</label>
              <input 
                type="text" 
                className="approval-input" 
                value={user.name || user.email || 'Unknown User'} 
                disabled 
                style={{ background: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }}
              />
            </div>

            <div className="approval-form-group">
              <label>Description about rules</label>
              <textarea 
                className="approval-input" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="E.g. Approval rule for miscellaneous expenses"
              />
            </div>

            <div className="approval-form-group">
              <label>Manager</label>
              <select 
                className="approval-select" 
                value={managerUid}
                onChange={(e) => setManagerUid(e.target.value)}
              >
                <option value="">-- No Manager Assigned --</option>
                {potentialManagers.map(mgr => (
                  <option key={mgr.uid} value={mgr.uid}>{mgr.name} ({mgr.email})</option>
                ))}
              </select>
              <span className="approval-checkbox-desc" style={{ display: 'block', marginTop: '6px' }}>
                Dynamic dropdown. Initially the manager record should be set, admin can change manager for approval if required.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Execution Pipeline */}
          <div className="approval-right">
            
            <div className="approval-checkbox-group highlight">
              <input 
                type="checkbox" 
                id="isMgrApprover"
                className="approval-checkbox" 
                checked={isManagerApprover}
                onChange={(e) => setIsManagerApprover(e.target.checked)}
              />
              <div className="approval-checkbox-label-content">
                <label htmlFor="isMgrApprover" className="approval-checkbox-title">Is manager an approver?</label>
                <span className="approval-checkbox-desc">If this field is checked, then by default the approve request would go to his/her manager first, before designated approvers.</span>
              </div>
            </div>

            <div className="approval-section-title">
              Approvers 
              <span style={{ fontSize: '0.8rem', color: '#6c5ce7', fontWeight: 400 }}>(Sequence Setup)</span>
            </div>
            
            <div className="approvers-list">
              {approvers.map((approver, idx) => (
                <div key={idx} className="approver-row">
                  <span className="approver-number">{idx + 1}</span>
                  <select 
                    className="approver-select"
                    value={approver.uid}
                    onChange={(e) => handleApproverChange(idx, 'uid', e.target.value)}
                  >
                    <option value="">-- Select Approver --</option>
                    {allUsers.map((u) => (
                      <option key={u.uid} value={u.uid}>{u.name || u.email}</option>
                    ))}
                  </select>
                  
                  <label className="mandatory-toggle" title="If ticked, anyhow approval of this approver is required in any scenario">
                    <input 
                      type="checkbox" 
                      className="approval-checkbox"
                      checked={approver.isMandatory}
                      onChange={(e) => handleApproverChange(idx, 'isMandatory', e.target.checked)}
                      style={{ width: '16px', height: '16px', margin: 0 }}
                    />
                    Mandatory
                  </label>

                  {approvers.length > 1 && (
                    <button className="remove-approver-btn" onClick={() => handleRemoveApprover(idx)} title="Remove Approver">
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button className="add-approver-btn" onClick={handleAddApprover}>
              + Add Custom Approver
            </button>

            <div className="approval-checkbox-group">
              <input 
                type="checkbox" 
                id="seqRequired"
                className="approval-checkbox" 
                checked={isSequenceRequired}
                onChange={(e) => setIsSequenceRequired(e.target.checked)}
              />
              <div className="approval-checkbox-label-content">
                <label htmlFor="seqRequired" className="approval-checkbox-title">Approvers Sequence Required?</label>
                <span className="approval-checkbox-desc">
                  If ticked true, sequence matters (Request goes to Approver 1, only if accepted goes to Approver 2). If required approver rejects, expense auto-rejects. If not ticked, send requests to all simultaneously.
                </span>
              </div>
            </div>

            <div className="approval-form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ margin: 0, fontWeight: 600 }}>Minimum Approval percentage:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="number" 
                  className="approval-input" 
                  style={{ width: '80px', padding: '6px 12px' }}
                  min="1" 
                  max="100"
                  value={minApprovalPercent}
                  onChange={(e) => setMinApprovalPercent(Number(e.target.value))}
                />
                <span style={{ fontWeight: 600, color: '#4b5563' }}>%</span>
              </div>
            </div>
            <div className="approval-checkbox-desc" style={{ marginTop: '-10px', marginBottom: '20px' }}>
              Specify the number of percentage approvers required in order to get the request approved.
            </div>

          </div>
        </div>

        <footer className="approval-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save Rules</button>
        </footer>

      </div>
    </div>
  );
};

export default ApprovalRulesModal;
