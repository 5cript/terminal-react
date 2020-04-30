/**
 *  Default mode object
 */
const ControlBits = 
{
    S7C1T: 7,
    S8C1T: 8
}

const Keypad = 
{
    Normal: 0,
    Application: 1
}

const CharacterSet = 
{
    ISO8859_1: 0,
    UTF8: 1,
    G0: 2,
    G1: 3,
    G2: 4,
    G3: 5
}

const CountryEncoding =
{
    _DEFAULT_CASE_IS_ERROR_IF_GSET_:  0,
    DrawingMode:  1,
    UnitedKingdom:  2,
    UnitedStates:  3,
    Dutch:  4,
    Finnish:  5,
    French:  6,
    FrenchCanadian:  7,
    German:  8,
    Italian:  9,
    NorwegianDanish:  10,
    Spanish:  11,
    Swedish:  12,
    Swiss:  13,
    Turkish: 14,
    Portuguese: 15,
    Hebrew: 16,
    Greek: 17,
    Supplemental: 18,
    Technical: 19,
    Russian: 20,
    ISO_Latin_1_Supplemental: 21,
    ISO_Greek_Supplemental: 22,
    ISO_Hebrew_Supplemental: 23,
    ISO_Latin_Cyrillic: 24,
    ISO_Latin_5_Supplemental: 25
}

const IRMode = 
{
    Insert:  0,
    Replace:  1
}

const ReportCommands = 
{
    CursorPosition:  6,
    PrinterStatus:  15,
    UdkStatus:  25,
    KeyboardStatus:  26,
    LocatorStatus:  53,
    LocatorStatus2:  55,
    LocatorType:  56,
    MacroSpace:  62,
    DataIntegrity:  75,
    MultiSessionConfig:  85
}

const DECCKM = 
{
    Normal: 0, 
    Application: 1
}

const DECDHL =
{
    Disabled: 0,
    Top: 1,
    Bottom: 2
};

const LineWidth = 
{
    DECSWL: 0,
    DECDWL: 1
}

class Mode 
{
    bits = ControlBits.S7C1T;
    ansiConformanceLevel = 0;
    keypadMode = Keypad.Normal;
    charSet = CharacterSet.UTF8;
    countryEnc = CountryEncoding.UnitedStates;
    decckm = DECCKM.Normal;
    altSendsEscape = true;
    decdhl = DECDHL.Disabled;
    lineWidth = LineWidth.DECSWL;
    screenAlignmentTest = false;

    clone = () => {
        return {
            bits: this.bits,
            ansiConformanceLevel: this.ansiConformanceLevel,
            keypadMode: this.keypadMode,
            charSet: this.charSet,
            countryEnc: this.countryEnc,
            decckm: this.decckm,
            altSendsEscape: this.altSendsEscape,
            decdhl: this.decdhl,
            lineWidth: this.lineWidth,
            screenAlignmentTest: this.screenAlignmentTest
        }
    }
};

export {ControlBits, DECCKM, DECDHL, LineWidth, ReportCommands, IRMode, CountryEncoding, CharacterSet, Keypad, Mode};
export default Mode;