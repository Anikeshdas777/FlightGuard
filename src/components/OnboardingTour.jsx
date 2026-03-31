// This file guides new users through the app features.
import React, { useState, useEffect } from 'react';

const TOUR_STEPS = [
    {
        targetId: 'tour-step-1', // Needs to be added to the Airline input in FlightPredictor
        title: 'Step 1: Enter your airline',
        content: 'Start by selecting or typing your airline to check historical delay data.',
        position: 'bottom'
    },
    {
        targetId: 'tour-step-2', // Needs to be added to the Predict Flight Risk button
        title: 'Step 2: Check risk',
        content: 'Click here to run our AI prediction model and instantly assess the probability of a delay.',
        position: 'bottom'
    },
    {
        targetId: 'tour-step-3', // Needs to be added to the Alerts navigation link in Header
        title: 'Step 3: Set up alerts',
        content: 'Navigate to the Alerts center to stay updated on critical flight disruptions in real-time.',
        position: 'bottom'
    }
];

// This component renders the onboarding tour view.
export default function OnboardingTour() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState(null);

    useEffect(() => {
        // Check if user has seen the tour before
        const hasSeenTour = localStorage.getItem('flightguard_tour_completed');

        if (!hasSeenTour) {
            // Add a small delay so underlying components render first
            const timer = setTimeout(() => {
                setIsVisible(true);
                updateTargetPosition(0);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Also update position on window resize
    useEffect(() => {
        if (!isVisible) return;

        // This function handles handle resize.
        const handleResize = () => updateTargetPosition(currentStep);
        window.addEventListener('resize', handleResize);

        // Setup MutationObserver to watch for DOM changes (in case target renders later)
        const observer = new MutationObserver(() => updateTargetPosition(currentStep));
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, [isVisible, currentStep]);

    // This function handles update target position.
    const updateTargetPosition = (stepIndex) => {
        const step = TOUR_STEPS[stepIndex];
        if (!step) return;

        const element = document.getElementById(step.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                windowScrollY: window.scrollY
            });
            // Auto scroll to element if not fully in view
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setTargetRect(null);
        }
    };

    // This function handles handle next.
    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            updateTargetPosition(currentStep + 1);
        } else {
            completeTour();
        }
    };

    // This function handles handle skip.
    const handleSkip = () => {
        completeTour();
    };

    // This function handles complete tour.
    const completeTour = () => {
        setIsVisible(false);
        localStorage.setItem('flightguard_tour_completed', 'true');
    };

    if (!isVisible || !targetRect) return null;

    const stepInfo = TOUR_STEPS[currentStep];

    // Calculate tooltip position based on target rect
    // Default to bottom
    let tooltipTop = targetRect.top + targetRect.height + targetRect.windowScrollY + 12;
    let tooltipLeft = targetRect.left + (targetRect.width / 2);

    // Adjust if it goes off screen
    const tooltipWidth = 320; // approximate width
    if (tooltipLeft + (tooltipWidth / 2) > window.innerWidth - 20) {
        tooltipLeft = window.innerWidth - 20 - (tooltipWidth / 2);
    }
    if (tooltipLeft - (tooltipWidth / 2) < 20) {
        tooltipLeft = 20 + (tooltipWidth / 2);
    }

    return (
        <div style={{
            position: 'absolute',
            zIndex: 9999,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Let clicks pass through overlay
        }}>
            {/* Highlight Spotlight (High z-index but still lets clicks through where transparent) */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                zIndex: 9998,
                pointerEvents: 'auto', // Capture clicks on the backdrop to prevent interaction
            }}>
                {/* Visual cutout for the target element using box-shadow trick */}
                <div style={{
                    position: 'absolute',
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                    borderRadius: 8,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.6), 0 0 15px rgba(245,196,0,0.8)',
                    background: 'transparent',
                    pointerEvents: 'none' // Don't capture clicks on the cutout itself
                }} />
            </div>

            {/* Tooltip Card */}
            <div style={{
                position: 'absolute',
                top: tooltipTop,
                left: tooltipLeft,
                transform: 'translateX(-50%)',
                width: 320,
                background: '#1e1e1e', // Dark theme card
                border: '1px solid #F5C400', // Gold accent border
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(245,196,0,0.2)',
                zIndex: 10000, // Topmost element
                pointerEvents: 'auto', // Allow interacting with tooltip buttons
                color: '#f0f0f0',
                fontFamily: "'Inter', sans-serif"
            }}>
                {/* Pointer Arrow */}
                <div style={{
                    position: 'absolute',
                    top: -6,
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                    width: 12,
                    height: 12,
                    background: '#1e1e1e',
                    borderLeft: '1px solid #F5C400',
                    borderTop: '1px solid #F5C400',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#F5C400', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Step {currentStep + 1} of {TOUR_STEPS.length}
                    </div>
                    <button onClick={handleSkip} style={{
                        background: 'transparent', border: 'none', color: '#a0a0a0',
                        cursor: 'pointer', fontSize: 19, padding: 0, lineHeight: 1
                    }}>✕</button>
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: 21, fontWeight: 800, color: '#f0f0f0' }}>{stepInfo.title}</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 17, color: '#a0a0a0', lineHeight: 1.5 }}>
                    {stepInfo.content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={handleSkip}
                        style={{ background: 'transparent', border: 'none', color: '#a0a0a0', cursor: 'pointer', fontSize: 17, fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f0f0f0'}
                        onMouseLeave={e => e.currentTarget.style.color = '#a0a0a0'}
                    >
                        Skip Tour
                    </button>

                    <button
                        onClick={handleNext}
                        style={{
                            background: '#F5C400', color: '#111111', border: 'none',
                            borderRadius: 6, padding: '8px 16px', fontSize: 17,
                            fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 0 10px rgba(245,196,0,0.3)'
                        }}
                    >
                        {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
