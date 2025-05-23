// circuit-animation.js
export const circuitAnimationHTML = `
               <!-- Ambient background glow effects -->
                <div class="absolute inset-0 overflow-hidden">
                    <div
                        class="absolute left-1/4 top-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-[#9FEF00]/5 blur-[100px]">
                    </div>
                    <div
                        class="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-[#0080FF]/5 blur-[120px] [animation-delay:1s]">
                    </div>
                    <div
                        class="absolute left-1/3 bottom-1/3 h-[250px] w-[250px] animate-pulse rounded-full bg-[#FF33A8]/5 blur-[80px] [animation-delay:2s]">
                    </div>
                </div>

                <!-- Remote Arduino Programming Background -->
                <div class="absolute inset-0 overflow-hidden">
                    <div class="absolute inset-0 overflow-hidden">
                        <!-- Fade overlay for edges -->


                        <!-- Dynamic particle background -->
                        <div class="absolute inset-0">
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 15%; top: 25%; animation-delay: 0.5s; animation-duration: 12s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 35%; top: 45%; animation-delay: 1.2s; animation-duration: 8s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 55%; top: 15%; animation-delay: 2.1s; animation-duration: 15s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 75%; top: 65%; animation-delay: 0.8s; animation-duration: 10s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 25%; top: 85%; animation-delay: 1.5s; animation-duration: 13s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 85%; top: 35%; animation-delay: 3.2s; animation-duration: 9s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 45%; top: 55%; animation-delay: 2.5s; animation-duration: 11s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 65%; top: 75%; animation-delay: 1.8s; animation-duration: 14s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 10%; top: 60%; animation-delay: 0.3s; animation-duration: 12s;"></div>
                            <div class="particle absolute h-1 w-1 rounded-full bg-[#9FEF00]/70"
                                style="left: 90%; top: 10%; animation-delay: 2.8s; animation-duration: 10s;"></div>

                        </div>

                        <!-- Floating IoT Devices Grid -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <!-- Grid of floating devices -->
                            <div class="device-grid relative h-full w-full">
                                <!-- Top Left - Arduino Mega -->
                                <div
                                    class="device-arduino-mega absolute left-[5%] top-[15%] h-[120px] w-[200px] rotate-12 transform rounded-md border border-[#9FEF00]/40 bg-[#0D141E]/80 p-3 shadow-[0_0_25px_rgba(159,239,0,0.3)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(159,239,0,0.5)]">
                                    <div
                                        class="absolute left-3 top-2 text-[10px] font-bold italic text-[#9FEF00] text-shadow-glow">
                                        ARDUINO MEGA
                                    </div>

                                    <!-- Microcontroller -->
                                    <div
                                        class="absolute left-[50%] top-[50%] h-[40px] w-[80px] -translate-x-1/2 -translate-y-1/2 rounded border border-[#9FEF00]/40 bg-[#111927] shadow-inner">
                                        <div
                                            class="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-[6px] text-[#9FEF00]/70">
                                            ATmega2560
                                        </div>
                                        <div class="mega-chip-glow absolute inset-0 rounded bg-[#9FEF00]/0"></div>
                                    </div>

                                    <!-- Pin rows -->
                                    <div class="absolute bottom-2 left-2 flex w-[180px] justify-between">
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[6px] w-[6px] rounded-full border border-[#9FEF00]/40 bg-[#0D141E]">
                                        </div>
                                    </div>

                                    <!-- LED indicators -->
                                    <div class="absolute right-3 top-3 flex gap-1">
                                        <div
                                            class="mega-led h-[4px] w-[4px] rounded-full border border-[#9FEF00] bg-transparent">
                                        </div>
                                        <div class="mega-led h-[4px] w-[4px] rounded-full border border-[#FF33A8] bg-transparent"
                                            style="animation-delay:0.5s"></div>
                                        <div class="mega-led h-[4px] w-[4px] rounded-full border border-[#0080FF] bg-transparent"
                                            style="animation-delay:1s"></div>
                                    </div>
                                </div>

                                <!-- Top Right - ESP32 -->
                                <div
                                    class="device-esp32 absolute right-[8%] top-[12%] h-[100px] w-[150px] -rotate-6 transform rounded-md border border-[#0080FF]/40 bg-[#0D141E]/80 p-3 shadow-[0_0_25px_rgba(0,128,255,0.3)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,128,255,0.5)]">
                                    <div
                                        class="absolute left-3 top-2 text-[10px] font-bold text-[#0080FF] text-shadow-glow">
                                        ESP32
                                    </div>

                                    <!-- WiFi Symbol -->
                                    <div class="absolute right-3 top-2">
                                        <div class="wifi-signal">
                                            <div class="wifi-circle"></div>
                                            <div class="wifi-circle"></div>
                                            <div class="wifi-circle"></div>
                                        </div>
                                    </div>

                                    <!-- Microcontroller -->
                                    <div
                                        class="absolute left-[50%] top-[50%] h-[30px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded border border-[#0080FF]/40 bg-[#111927] shadow-inner">
                                        <div
                                            class="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-[6px] text-[#0080FF]/70">
                                            ESP32
                                        </div>
                                        <div class="esp-chip-glow absolute inset-0 rounded bg-[#0080FF]/0"></div>
                                    </div>

                                    <!-- Antenna -->
                                    <div
                                        class="absolute -right-1 top-[40%] h-[30px] w-[5px] border-r border-t border-[#0080FF]/40">
                                    </div>
                                </div>

                                <!-- Bottom Left - Raspberry Pi Pico -->
                                <div
                                    class="device-pico absolute bottom-[20%] left-[10%] h-[90px] w-[140px] rotate-[-12deg] transform rounded-md border border-[#FF33A8]/40 bg-[#0D141E]/80 p-3 shadow-[0_0_25px_rgba(255,51,168,0.3)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,51,168,0.5)]">
                                    <div
                                        class="absolute left-3 top-2 text-[8px] font-bold text-[#FF33A8] text-shadow-glow">
                                        RASPBERRY PI PICO
                                    </div>

                                    <!-- Microcontroller -->
                                    <div
                                        class="absolute left-[50%] top-[50%] h-[25px] w-[50px] -translate-x-1/2 -translate-y-1/2 rounded border border-[#FF33A8]/40 bg-[#111927] shadow-inner">
                                        <div
                                            class="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-[5px] text-[#FF33A8]/70">
                                            RP2040
                                        </div>
                                        <div class="pico-chip-glow absolute inset-0 rounded bg-[#FF33A8]/0"></div>
                                    </div>

                                    <!-- USB Port -->
                                    <div
                                        class="absolute -top-1 left-[50%] h-[8px] w-[16px] -translate-x-1/2 border border-[#FF33A8]/40 bg-[#111927]">
                                    </div>

                                    <!-- Pin indicators -->
                                    <div class="absolute bottom-1 left-2 right-2 flex justify-between">
                                        <div
                                            class="h-[3px] w-[3px] rounded-full border border-[#FF33A8]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[3px] w-[3px] rounded-full border border-[#FF33A8]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[3px] w-[3px] rounded-full border border-[#FF33A8]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[3px] w-[3px] rounded-full border border-[#FF33A8]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[3px] w-[3px] rounded-full border border-[#FF33A8]/40 bg-[#0D141E]">
                                        </div>
                                        <div
                                            class="h-[3px] w-[3px] rounded-full border border-[#FF33A8]/40 bg-[#0D141E]">
                                        </div>
                                    </div>
                                </div>

                                <!-- Bottom Right - Arduino Nano -->
                                <div
                                    class="device-nano absolute bottom-[15%] right-[12%] h-[100px] w-[140px] rotate-[8deg] transform rounded-md border border-[#9FEF00]/40 bg-[#0D141E]/80 p-2 shadow-[0_0_25px_rgba(159,239,0,0.3)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(159,239,0,0.5)]">
                                    <div class=" absolute left-2 top-1 text-[8px] font-bold italic text-[#9FEF00]
                                    text-shadow-glow">
                                        ARDUINO NANO
                                    </div>

                                    <!-- Microcontroller -->
                                    <div
                                        class="absolute left-[50%] top-[50%] h-[30px] w-[50px] -translate-x-1/2 -translate-y-1/2 rounded border border-[#9FEF00]/40 bg-[#111927] shadow-inner">
                                        <div
                                            class="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-[5px] text-[#9FEF00]/70">
                                            ATmega328P
                                        </div>
                                        <div class="nano-chip-glow absolute inset-0 rounded bg-[#9FEF00]/0"></div>
                                    </div>

                                    <!-- LED -->
                                    <div
                                        class="nano-led absolute right-2 top-2 h-[4px] w-[4px] rounded-full border border-[#9FEF00] bg-transparent">
                                    </div>
                                </div>

                                <!-- Center - Code Editor -->

                                <!-- Data Visualization Panel -->

                                <!-- Connection lines between devices -->
                                <div class="connection-lines absolute inset-0">
                                    <!-- Line from ESP32 to Code Editor -->
                                    <div
                                        class="connection-line-esp absolute right-[22%] top-[20%] h-[1px] w-[15%] bg-gradient-to-l from-[#0080FF]/60 to-[#9FEF00]/60">
                                    </div>

                                    <!-- Line from Arduino Mega to Code Editor -->
                                    <div
                                        class="connection-line-mega absolute left-[23%] top-[25%] h-[1px] w-[15%] bg-gradient-to-r from-[#9FEF00]/60 to-[#9FEF00]/60">
                                    </div>

                                    <!-- Line from Pico to Data Panel -->
                                    <div
                                        class="connection-line-pico absolute bottom-[30%] left-[25%] h-[1px] w-[10%] bg-gradient-to-r from-[#FF33A8]/60 to-[#9FEF00]/60">
                                    </div>

                                    <!-- Line from Nano to Data Panel -->
                                    <div
                                        class="connection-line-nano absolute bottom-[25%] right-[25%] h-[1px] w-[10%] bg-gradient-to-l from-[#9FEF00]/60 to-[#9FEF00]/60">
                                    </div>
                                    <div class="absolute inset-0 -z-10">
                            <!-- Horizontal circuit lines -->
                            <div
                                class="circuit-line-h absolute left-0 top-[10%] h-[1px] w-0 bg-gradient-to-r from-[#9FEF00]/30 to-[#9FEF00]/60">
                            </div>
                            <div class="circuit-line-h absolute left-0 top-[30%] h-[1px] w-0 bg-gradient-to-r from-[#9FEF00]/30 to-[#9FEF00]/60"
                                style="animation-delay: 0.2s;"></div>
                            <div class="circuit-line-h absolute left-[15%] top-[50%] h-[1px] w-0 bg-gradient-to-r from-[#9FEF00]/30 to-[#9FEF00]/60"
                                style="animation-delay: 0.4s;"></div>
                            <div class="circuit-line-h absolute left-0 top-[70%] h-[1px] w-0 bg-gradient-to-r from-[#9FEF00]/30 to-[#9FEF00]/60"
                                style="animation-delay: 0.6s;"></div>
                            <div class="circuit-line-h absolute left-[25%] top-[90%] h-[1px] w-0 bg-gradient-to-r from-[#9FEF00]/30 to-[#9FEF00]/60"
                                style="animation-delay: 0.8s;"></div>

                                </div>

                                </div>
                            </div>
                        </div>


                    </div>
                </div>

`;

export function initCircuitAnimation() {
    const container = document.querySelector('.hero-section');
    if (container) {
        container.insertAdjacentHTML('afterbegin', circuitAnimationHTML);
        // Re-initialize particles if needed
        if (window.createCircuitParticles) createCircuitParticles();
    }
}