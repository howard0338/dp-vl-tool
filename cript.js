warning: in the working copy of 'styles.css', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/styles.css b/styles.css[m
[1mindex 1f696a6..d7178b1 100644[m
[1m--- a/styles.css[m
[1m+++ b/styles.css[m
[36m@@ -1324,3 +1324,74 @@[m [mheader p {[m
     transform: translateY(-2px);[m
     box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);[m
 }[m
[32m+[m
[32m+[m[32m/* Bon Split Content */[m
[32m+[m[32m.bon-split-content {[m
[32m+[m[32m    display: flex;[m
[32m+[m[32m    gap: 30px;[m
[32m+[m[32m    align-items: flex-start;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.grid-container {[m
[32m+[m[32m    flex: 1;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.player-count-info {[m
[32m+[m[32m    background: linear-gradient(45deg, #4299e1, #3182ce);[m
[32m+[m[32m    color: white;[m
[32m+[m[32m    padding: 15px 25px;[m
[32m+[m[32m    border-radius: 20px;[m
[32m+[m[32m    font-size: 1rem;[m
[32m+[m[32m    font-weight: 600;[m
[32m+[m[32m    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);[m
[32m+[m[32m    white-space: nowrap;[m
[32m+[m[32m    height: fit-content;[m
[32m+[m[32m    margin-top: 0;[m
[32m+[m[32m    align-self: flex-start;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.count-label {[m
[32m+[m[32m    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);[m
[32m+[m[32m}[m
[32m+[m
[32m+[m
[32m+[m[32m/* 響應式設計 */[m
[32m+[m[32m@media (max-width: 768px) {[m
[32m+[m[32m    .bon-split-content {[m
[32m+[m[32m        flex-direction: column;[m
[32m+[m[32m        gap: 15px;[m
[32m+[m[32m        align-items: center;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    .player-count-info {[m
[32m+[m[32m        margin-top: 0;[m
[32m+[m[32m        order: -1;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    .modal-content {[m
[32m+[m[32m        width: 95%;[m
[32m+[m[32m        margin: 10px;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    .modal-header {[m
[32m+[m[32m        padding: 15px 20px;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    .modal-body {[m
[32m+[m[32m        padding: 20px;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    .modal-actions {[m
[32m+[m[32m        flex-direction: column;[m
[32m+[m[32m        align-items: center;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    .modal-actions button {[m
[32m+[m[32m        width: 100%;[m
[32m+[m[32m        max-width: 200px;[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    .preview-grid {[m
[32m+[m[32m        grid-template-columns: 1fr;[m
[32m+[m[32m    }[m
[32m+[m[32m}[m
