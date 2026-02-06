"""
Test Installation Script
Run this to verify that all components are installed correctly
"""

import sys
import importlib.util


def check_module(module_name, package_name=None):
    """Check if a module is installed"""
    if package_name is None:
        package_name = module_name

    spec = importlib.util.find_spec(module_name)
    if spec is None:
        print(f"❌ {package_name} is NOT installed")
        return False
    else:
        print(f"✅ {package_name} is installed")
        return True


def check_python_version():
    """Check if Python version is compatible"""
    print("\n" + "=" * 60)
    print("Checking Python Version")
    print("=" * 60)

    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")

    if version.major >= 3 and version.minor >= 8:
        print("✅ Python version is compatible (3.8+)")
        return True
    else:
        print("❌ Python version is too old. Please upgrade to 3.8 or higher.")
        return False


def check_dependencies():
    """Check if all required dependencies are installed"""
    print("\n" + "=" * 60)
    print("Checking Dependencies")
    print("=" * 60 + "\n")

    dependencies = [
        ("streamlit", "streamlit"),
        ("insightface", "deepface"),
        ("onnxruntime", "onnxruntime"),
        ("cv2", "opencv-python"),
        ("numpy", "numpy"),
        ("PIL", "Pillow"),
        ("sklearn", "scikit-learn"),
    ]

    all_installed = True
    for module, package in dependencies:
        if not check_module(module, package):
            all_installed = False

    return all_installed


def test_face_recognition_module():
    """Test if face recognition module can be imported"""
    print("\n" + "=" * 60)
    print("Testing Face Recognition Module")
    print("=" * 60 + "\n")

    try:
        from face_recognition import FaceRecognizer, FaceDatabase

        print("✅ face_recognition module imported successfully")

        # Try to initialize (this will download the model if needed)
        print("\nInitializing FaceRecognizer...")
        print("(First run will download model ~100MB, please wait...)")

        recognizer = FaceRecognizer(use_gpu=False)
        print("✅ FaceRecognizer initialized successfully")

        database = FaceDatabase("test_db.pkl")
        print("✅ FaceDatabase initialized successfully")

        return True

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def check_gpu_support():
    """Check if GPU support is available"""
    print("\n" + "=" * 60)
    print("Checking GPU Support")
    print("=" * 60 + "\n")

    try:
        import onnxruntime as ort

        providers = ort.get_available_providers()

        print(f"Available providers: {providers}")

        if "CUDAExecutionProvider" in providers:
            print("✅ GPU (CUDA) support is available")
            return True
        else:
            print("⚠️  GPU support not available (CPU mode only)")
            print("   To enable GPU, install: pip install onnxruntime-gpu")
            return False

    except Exception as e:
        print(f"❌ Error checking GPU: {str(e)}")
        return False


def print_summary(results):
    """Print test summary"""
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60 + "\n")

    all_passed = all(results.values())

    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")

    print("\n" + "=" * 60)

    if all_passed:
        print("🎉 All tests passed! System is ready to use.")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Prepare your photos in people_photos/ folder")
        print("2. Run: python build_database.py --folder people_photos")
        print("3. Run: streamlit run streamlit_app.py")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("=" * 60)
        print("\nTroubleshooting:")
        print("- Make sure you're in the project directory")
        print("- Activate virtual environment if using one")
        print("- Run: pip install -r requirements.txt")

    print()


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("FACE RECOGNITION SYSTEM - INSTALLATION TEST")
    print("=" * 60)

    results = {}

    # Run tests
    results["Python Version"] = check_python_version()
    results["Dependencies"] = check_dependencies()
    results["Face Recognition Module"] = test_face_recognition_module()
    results["GPU Support (Optional)"] = check_gpu_support()

    # Print summary
    print_summary(results)

    # Return exit code
    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
