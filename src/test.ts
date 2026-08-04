// Test entry point - imports all test files and their component files
// This ensures all Angular decorators are in the TypeScript program

// Test files
import './app/shared/components/skeleton/skeleton.component.spec';
import './app/shared/components/skeleton/skeleton-card.component.spec';
import './app/shared/components/back-to-top/back-to-top.component.spec';
import './app/shared/components/toast/toast-container.component.spec';
import './app/shared/components/toast/toast.service.spec';
import './app/core/services/breadcrumb.service.spec';
import './app/core/services/theme.service.spec';
import './app/core/services/inscriptions.service.spec';
import './app/core/auth/auth.guard.spec';

import './app/features/public/inscripcion/components/typeform-flow.component.spec';
import './app/features/public/inscripcion/components/stage-plot/stage-plot.component';
import './app/features/public/inscripcion/components/contact-form.component';

// Component files (to ensure Angular decorators are in the program)
import './app/shared/components/skeleton/skeleton.component';
import './app/shared/components/skeleton/skeleton-card.component';
import './app/shared/components/back-to-top/back-to-top.component';
import './app/shared/components/toast/toast-container.component';
import './app/shared/components/toast/toast.service';
import './app/core/services/breadcrumb.service';
import './app/core/services/theme.service';
import './app/core/services/inscriptions.service';
import './app/core/auth/auth.service';

// Additional component files from inscripcion page
import './app/features/public/inscripcion/components/constancia.component';
import './app/features/public/inscripcion/components/step-1.component';
import './app/features/public/inscripcion/components/step-2.component';
import './app/features/public/inscripcion/components/step-3.component';
import './app/features/public/inscripcion/components/step-4.component';
import './app/features/public/inscripcion/components/step-5.component';
import './app/features/public/inscripcion/components/step-6.component';
import './app/features/public/inscripcion/components/step-7.component';
import './app/features/public/inscripcion/components/step-accessos.component';