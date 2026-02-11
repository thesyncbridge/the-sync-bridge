import requests
import sys
import json
from datetime import datetime

class TheSyncBridgeAPITester:
    def __init__(self, base_url="https://budget-tracker-1318.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result["error"] = response.json()
                except:
                    result["error"] = response.text

            self.test_results.append(result)
            return success, result["response_data"] if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_mission_status(self):
        """Test mission status endpoint"""
        success, response = self.run_test(
            "Mission Status",
            "GET",
            "mission/status",
            200
        )
        if success:
            required_fields = ['current_day', 'total_days', 'days_remaining', 'mission_start', 'progress_percent', 'is_active']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing field: {field}")
                    return False
            print(f"   Current Day: {response.get('current_day')}/{response.get('total_days')}")
            print(f"   Progress: {response.get('progress_percent')}%")
        return success

    def test_guardian_registration(self, email):
        """Test guardian registration"""
        success, response = self.run_test(
            "Guardian Registration",
            "POST",
            "guardians/register",
            200,
            data={"email": email}
        )
        if success:
            required_fields = ['id', 'email', 'scroll_id', 'registered_at', 'is_certified']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing field: {field}")
                    return False, None
            print(f"   Scroll ID: {response.get('scroll_id')}")
            print(f"   Email: {response.get('email')}")
            return True, response
        return False, None

    def test_duplicate_registration(self, email):
        """Test duplicate email registration returns existing guardian"""
        success, response = self.run_test(
            "Duplicate Registration Check",
            "POST",
            "guardians/register",
            200,
            data={"email": email}
        )
        return success, response

    def test_guardian_lookup(self, email):
        """Test guardian lookup by email"""
        success, response = self.run_test(
            "Guardian Lookup",
            "GET",
            "guardians/lookup",
            200,
            params={"email": email}
        )
        return success, response

    def test_guardian_count(self):
        """Test guardian count endpoint"""
        success, response = self.run_test(
            "Guardian Count",
            "GET",
            "guardians/count",
            200
        )
        if success and 'count' in response:
            print(f"   Total Guardians: {response['count']}")
        return success

    def test_guardian_registry(self):
        """Test guardian registry endpoint"""
        success, response = self.run_test(
            "Guardian Registry",
            "GET",
            "guardians/registry",
            200
        )
        if success:
            print(f"   Registry entries: {len(response)}")
        return success

    def test_certificate(self, scroll_id):
        """Test certificate endpoint"""
        success, response = self.run_test(
            "Certificate Retrieval",
            "GET",
            f"certificate/{scroll_id}",
            200
        )
        if success:
            required_fields = ['scroll_id', 'registered_at', 'is_certified', 'certificate_title']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing field: {field}")
                    return False
            print(f"   Certificate for: {response.get('scroll_id')}")
        return success

    def test_transmissions(self):
        """Test transmissions endpoint"""
        success, response = self.run_test(
            "Transmissions",
            "GET",
            "transmissions",
            200
        )
        if success:
            print(f"   Transmissions found: {len(response)}")
        return success

    def test_admin_login(self, password="syncbridge325"):
        """Test admin login"""
        import base64
        auth_string = base64.b64encode(f"admin:{password}".encode()).decode()
        headers = {'Authorization': f'Basic {auth_string}', 'Content-Type': 'application/json'}
        
        url = f"{self.api_url}/admin/login"
        self.tests_run += 1
        print(f"\n🔍 Testing Admin Login...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True, auth_string
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_add_transmission(self, auth_string):
        """Test adding a transmission (admin only)"""
        headers = {'Authorization': f'Basic {auth_string}', 'Content-Type': 'application/json'}
        data = {
            "title": "Test Transmission",
            "description": "This is a test transmission for API testing",
            "video_url": "https://youtube.com/watch?v=test123",
            "day_number": 999
        }
        
        url = f"{self.api_url}/transmissions"
        self.tests_run += 1
        print(f"\n🔍 Testing Add Transmission...")
        
        try:
            response = requests.post(url, json=data, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_data = response.json()
                print(f"   Created transmission ID: {response_data.get('id')}")
                return True, response_data
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_delete_transmission(self, auth_string, transmission_id):
        """Test deleting a transmission (admin only)"""
        headers = {'Authorization': f'Basic {auth_string}', 'Content-Type': 'application/json'}
        
        url = f"{self.api_url}/transmissions/{transmission_id}"
        self.tests_run += 1
        print(f"\n🔍 Testing Delete Transmission...")
        
        try:
            response = requests.delete(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_merchandise(self):
        """Test merchandise endpoint"""
        success, response = self.run_test(
            "Merchandise",
            "GET",
            "merchandise",
            200
        )
        if success:
            expected_products = ['hoodie', 'shirt', 'hat']
            for product in expected_products:
                if product not in response:
                    print(f"❌ Missing product: {product}")
                    return False
                else:
                    print(f"   {product}: ${response[product]['price']}")
        return success

    def test_create_order(self, scroll_id):
        """Test creating an order"""
        data = {
            "scroll_id": scroll_id,
            "email": "test@syncbridge.com",
            "items": [
                {"product_type": "hoodie", "size": "L", "quantity": 1},
                {"product_type": "hat", "quantity": 1}
            ],
            "shipping_name": "Test Guardian",
            "shipping_address": "123 Test St",
            "shipping_city": "Test City",
            "shipping_state": "TS",
            "shipping_zip": "12345",
            "shipping_country": "USA"
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=data
        )
        if success:
            print(f"   Order ID: {response.get('id')}")
            print(f"   Total: ${response.get('total_amount')}")
            return True, response
        return False, None

    def test_get_orders(self, auth_string):
        """Test getting orders (admin only)"""
        headers = {'Authorization': f'Basic {auth_string}', 'Content-Type': 'application/json'}
        
        url = f"{self.api_url}/orders"
        self.tests_run += 1
        print(f"\n🔍 Testing Get Orders (Admin)...")
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                orders = response.json()
                print(f"   Orders found: {len(orders)}")
                return True, orders
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_create_comment(self, transmission_id, scroll_id):
        """Test creating a comment on a transmission"""
        data = {
            "transmission_id": transmission_id,
            "scroll_id": scroll_id,
            "content": "This is a test comment from the API test suite",
            "parent_id": None
        }
        
        success, response = self.run_test(
            "Create Comment",
            "POST",
            "comments",
            200,
            data=data
        )
        if success:
            print(f"   Comment ID: {response.get('id')}")
            print(f"   Content: {response.get('content')}")
            return True, response
        return False, None

    def test_get_comments(self, transmission_id):
        """Test getting comments for a transmission"""
        success, response = self.run_test(
            "Get Comments",
            "GET",
            f"comments/{transmission_id}",
            200
        )
        if success:
            print(f"   Comments found: {len(response)}")
        return success, response

    def test_create_reply(self, transmission_id, scroll_id, parent_comment_id):
        """Test creating a reply to a comment"""
        data = {
            "transmission_id": transmission_id,
            "scroll_id": scroll_id,
            "content": "This is a test reply to the comment",
            "parent_id": parent_comment_id
        }
        
        success, response = self.run_test(
            "Create Reply",
            "POST",
            "comments",
            200,
            data=data
        )
        if success:
            print(f"   Reply ID: {response.get('id')}")
            print(f"   Parent ID: {response.get('parent_id')}")
            return True, response
        return False, None

    def test_delete_own_comment(self, comment_id, scroll_id):
        """Test deleting own comment (guardian)"""
        success, response = self.run_test(
            "Delete Own Comment",
            "DELETE",
            f"comments/{comment_id}/user",
            200,
            params={"scroll_id": scroll_id}
        )
        return success

    def test_admin_create_comment(self, auth_string, transmission_id):
        """Test admin creating comment as ADMIN"""
        headers = {'Authorization': f'Basic {auth_string}', 'Content-Type': 'application/json'}
        data = {
            "transmission_id": transmission_id,
            "scroll_id": "ADMIN",
            "content": "This is an admin comment for testing",
            "parent_id": None
        }
        
        url = f"{self.api_url}/comments/admin"
        self.tests_run += 1
        print(f"\n🔍 Testing Admin Create Comment...")
        
        try:
            response = requests.post(url, json=data, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_data = response.json()
                print(f"   Admin comment ID: {response_data.get('id')}")
                return True, response_data
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_admin_delete_comment(self, auth_string, comment_id):
        """Test admin deleting any comment"""
        headers = {'Authorization': f'Basic {auth_string}', 'Content-Type': 'application/json'}
        
        url = f"{self.api_url}/comments/{comment_id}"
        self.tests_run += 1
        print(f"\n🔍 Testing Admin Delete Comment...")
        
        try:
            response = requests.delete(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_get_all_comments_admin(self, auth_string):
        """Test admin getting all comments"""
        headers = {'Authorization': f'Basic {auth_string}', 'Content-Type': 'application/json'}
        
        url = f"{self.api_url}/comments/all/admin"
        self.tests_run += 1
        print(f"\n🔍 Testing Get All Comments (Admin)...")
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                comments = response.json()
                print(f"   Total comments found: {len(comments)}")
                return True, comments
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                return False, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

def main():
    print("🚀 Starting TheSyncBridge API Tests")
    print("=" * 50)
    
    tester = TheSyncBridgeAPITester()
    test_email = f"test_guardian_{datetime.now().strftime('%H%M%S')}@syncbridge.com"
    
    # Test 1: Mission Status
    print("\n📊 Testing Mission Status...")
    tester.test_mission_status()
    
    # Test 2: Guardian Count (before registration)
    print("\n👥 Testing Guardian Count...")
    tester.test_guardian_count()
    
    # Test 3: Guardian Registration
    print(f"\n📝 Testing Guardian Registration with {test_email}...")
    reg_success, guardian_data = tester.test_guardian_registration(test_email)
    
    if not reg_success:
        print("❌ Registration failed, stopping dependent tests")
        print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        return 1
    
    scroll_id = guardian_data.get('scroll_id')
    
    # Test 4: Duplicate Registration
    print(f"\n🔄 Testing Duplicate Registration with {test_email}...")
    dup_success, dup_data = tester.test_duplicate_registration(test_email)
    if dup_success and dup_data.get('scroll_id') == scroll_id:
        print("✅ Duplicate registration correctly returned existing guardian")
    else:
        print("❌ Duplicate registration did not return existing guardian")
    
    # Test 5: Guardian Lookup
    print(f"\n🔍 Testing Guardian Lookup with {test_email}...")
    lookup_success, lookup_data = tester.test_guardian_lookup(test_email)
    if lookup_success and lookup_data.get('scroll_id') == scroll_id:
        print("✅ Lookup correctly found guardian")
    else:
        print("❌ Lookup failed to find guardian")
    
    # Test 6: Certificate
    print(f"\n🏆 Testing Certificate for {scroll_id}...")
    tester.test_certificate(scroll_id)
    
    # Test 7: Guardian Registry
    print("\n📋 Testing Guardian Registry...")
    tester.test_guardian_registry()
    
    # Test 8: Guardian Count (after registration)
    print("\n👥 Testing Guardian Count (after registration)...")
    tester.test_guardian_count()
    
    # Test 9: Transmissions
    print("\n📡 Testing Transmissions...")
    tester.test_transmissions()
    
    # Test 10: Admin Login
    print("\n🔐 Testing Admin Login...")
    admin_success, auth_string = tester.test_admin_login()
    
    if admin_success:
        # Test 11: Add Transmission (Admin)
        print("\n➕ Testing Add Transmission (Admin)...")
        add_success, transmission_data = tester.test_add_transmission(auth_string)
        
        if add_success:
            # Test 12: Delete Transmission (Admin)
            print("\n🗑️ Testing Delete Transmission (Admin)...")
            tester.test_delete_transmission(auth_string, transmission_data.get('id'))
    
    # Test 13: Merchandise
    print("\n🛍️ Testing Merchandise...")
    tester.test_merchandise()
    
    # Test 14: Create Order
    print(f"\n📦 Testing Create Order with {scroll_id}...")
    order_success, order_data = tester.test_create_order(scroll_id)
    
    if admin_success:
        # Test 15: Get Orders (Admin)
        print("\n📋 Testing Get Orders (Admin)...")
        tester.test_get_orders(auth_string)
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        print("\nFailed tests:")
        for result in tester.test_results:
            if not result['success']:
                print(f"  - {result['test_name']}: {result.get('error', 'Status mismatch')}")
        return 1

if __name__ == "__main__":
    sys.exit(main())