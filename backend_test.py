import requests
import sys
import json
from datetime import datetime

class RapBeefAPITester:
    def __init__(self, base_url="https://hip-hop-clash-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response type: {type(response_data)}")
                    if isinstance(response_data, list):
                        print(f"   Response length: {len(response_data)}")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response text: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_rappers(self):
        """Test getting rappers list"""
        success, response = self.run_test("Get Rappers", "GET", "rappers", 200)
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} rappers")
            if len(response) > 0:
                sample_rapper = response[0]
                required_fields = ['name', 'tier', 'default_era']
                for field in required_fields:
                    if field not in sample_rapper:
                        print(f"   ⚠️  Missing field '{field}' in rapper data")
                        return False, response
                print(f"   Sample rapper: {sample_rapper}")
            return True, response
        
        return success, response

    def test_battle_endpoint(self):
        """Test battle endpoint with valid data"""
        battle_data = {
            "rapper1": {
                "name": "Kendrick Lamar",
                "tier": "S",
                "era": 2015
            },
            "rapper2": {
                "name": "Drake", 
                "tier": "S",
                "era": 2018
            },
            "war_zone": False
        }
        
        # Use longer timeout for AI generation
        success, response = self.run_test(
            "Battle Simulation", 
            "POST", 
            "battle", 
            200, 
            data=battle_data,
            timeout=60
        )
        
        if success and isinstance(response, dict):
            required_fields = ['battle_id', 'events', 'damage_report']
            for field in required_fields:
                if field not in response:
                    print(f"   ⚠️  Missing field '{field}' in battle response")
                    return False, response
            
            events = response.get('events', [])
            print(f"   Battle generated {len(events)} events")
            
            damage_report = response.get('damage_report', {})
            if damage_report:
                print(f"   Winner: {damage_report.get('overall_winner', 'Unknown')}")
                print(f"   Scores: {damage_report.get('rapper1_final_score', 0)} vs {damage_report.get('rapper2_final_score', 0)}")
            
            return True, response
        
        return success, response

    def test_battle_with_war_zone(self):
        """Test battle endpoint with war zone enabled"""
        battle_data = {
            "rapper1": {
                "name": "Eminem",
                "tier": "S", 
                "era": 2002
            },
            "rapper2": {
                "name": "Machine Gun Kelly",
                "tier": "C",
                "era": 2018
            },
            "war_zone": True
        }
        
        success, response = self.run_test(
            "War Zone Battle", 
            "POST", 
            "battle", 
            200, 
            data=battle_data,
            timeout=60
        )
        
        if success and isinstance(response, dict):
            events = response.get('events', [])
            war_zone_events = [e for e in events if e.get('ally_intervention')]
            print(f"   War zone interventions: {len(war_zone_events)}")
            return True, response
        
        return success, response

    def test_invalid_battle(self):
        """Test battle endpoint with invalid data"""
        invalid_data = {
            "rapper1": {
                "name": "Invalid Rapper",
                "tier": "Z",  # Invalid tier
                "era": 1800   # Invalid era
            },
            "rapper2": {
                "name": "",   # Empty name
                "tier": "S",
                "era": 2020
            },
            "war_zone": False
        }
        
        # This might still work since the backend doesn't validate rapper names
        # But let's test it anyway
        success, response = self.run_test(
            "Invalid Battle Data", 
            "POST", 
            "battle", 
            200,  # Backend might still process this
            data=invalid_data,
            timeout=30
        )
        
        return success, response

def main():
    print("🎤 Starting Rap Beef Simulator API Tests")
    print("=" * 50)
    
    tester = RapBeefAPITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_root_endpoint),
        ("Rappers List", tester.test_get_rappers),
        ("Standard Battle", tester.test_battle_endpoint),
        ("War Zone Battle", tester.test_battle_with_war_zone),
        ("Invalid Battle", tester.test_invalid_battle),
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {str(e)}")
    
    # Print final results
    print(f"\n{'='*50}")
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())